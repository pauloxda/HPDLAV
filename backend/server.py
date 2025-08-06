from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class WashRegistration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data: str  # Date in YYYY-MM-DD format
    tipo_veiculo: str
    area_negocio: str
    lavador: str
    tipo_lavagem: str
    empresa_tipo: str  # "interna" or "externa"
    empresa_nome: str
    matricula_trator: Optional[str] = ""
    matricula_reboque: Optional[str] = ""
    valor: float
    observacoes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WashRegistrationCreate(BaseModel):
    data: str
    tipo_veiculo: str
    area_negocio: str
    lavador: str
    tipo_lavagem: str
    empresa_tipo: str
    empresa_nome: str
    matricula_trator: Optional[str] = ""
    matricula_reboque: Optional[str] = ""
    valor: float
    observacoes: Optional[str] = ""

class CustomWasher(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomWasherCreate(BaseModel):
    nome: str

class ExternalCompany(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExternalCompanyCreate(BaseModel):
    nome: str

class AuthRequest(BaseModel):
    password: str

# Auth endpoint
@api_router.post("/auth")
async def authenticate(auth: AuthRequest):
    if auth.password == "HPD0909":
        return {"authenticated": True, "message": "Acesso autorizado"}
    else:
        raise HTTPException(status_code=401, detail="Password incorreta")

# Wash registration endpoints
@api_router.post("/lavagens", response_model=WashRegistration)
async def create_wash_registration(wash: WashRegistrationCreate):
    wash_dict = wash.dict()
    wash_obj = WashRegistration(**wash_dict)
    await db.lavagens.insert_one(wash_obj.dict())
    return wash_obj

@api_router.get("/lavagens", response_model=List[WashRegistration])
async def get_wash_registrations():
    lavagens = await db.lavagens.find().sort("created_at", -1).to_list(1000)
    return [WashRegistration(**lavagem) for lavagem in lavagens]

@api_router.get("/lavagens/today", response_model=List[WashRegistration])
async def get_today_washes():
    today = datetime.now().strftime("%Y-%m-%d")
    lavagens = await db.lavagens.find({"data": today}).sort("created_at", -1).to_list(1000)
    return [WashRegistration(**lavagem) for lavagem in lavagens]

@api_router.get("/lavagens/month/{year}/{month}", response_model=List[WashRegistration])
async def get_month_washes(year: int, month: int):
    # Get all washes for the specific month/year
    lavagens = await db.lavagens.find().to_list(1000)
    month_washes = []
    for lavagem in lavagens:
        try:
            wash_date = datetime.strptime(lavagem["data"], "%Y-%m-%d")
            if wash_date.year == year and wash_date.month == month:
                month_washes.append(WashRegistration(**lavagem))
        except:
            continue
    return month_washes

@api_router.delete("/lavagens/{wash_id}")
async def delete_wash_registration(wash_id: str):
    result = await db.lavagens.delete_one({"id": wash_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lavagem não encontrada")
    return {"message": "Lavagem eliminada com sucesso"}

# Custom washers endpoints
@api_router.post("/lavadores", response_model=CustomWasher)
async def add_custom_washer(washer: CustomWasherCreate):
    # Check if washer already exists
    existing = await db.lavadores.find_one({"nome": washer.nome})
    if existing:
        raise HTTPException(status_code=400, detail="Lavador já existe")
    
    washer_dict = washer.dict()
    washer_obj = CustomWasher(**washer_dict)
    await db.lavadores.insert_one(washer_obj.dict())
    return washer_obj

@api_router.get("/lavadores", response_model=List[CustomWasher])
async def get_custom_washers():
    lavadores = await db.lavadores.find().sort("nome", 1).to_list(1000)
    return [CustomWasher(**lavador) for lavador in lavadores]

# External companies endpoints
@api_router.post("/empresas-externas", response_model=ExternalCompany)
async def add_external_company(company: ExternalCompanyCreate):
    # Check if company already exists
    existing = await db.empresas_externas.find_one({"nome": company.nome})
    if existing:
        raise HTTPException(status_code=400, detail="Empresa já existe")
    
    company_dict = company.dict()
    company_obj = ExternalCompany(**company_dict)
    await db.empresas_externas.insert_one(company_obj.dict())
    return company_obj

@api_router.get("/empresas-externas", response_model=List[ExternalCompany])
async def get_external_companies():
    empresas = await db.empresas_externas.find().sort("nome", 1).to_list(1000)
    return [ExternalCompany(**empresa) for empresa in empresas]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()