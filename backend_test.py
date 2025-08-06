#!/usr/bin/env python3
"""
HPD Wash Management System Backend Tests
Tests all backend endpoints with realistic Portuguese data
"""

import requests
import json
from datetime import datetime, date
import sys
import os

# Get backend URL from frontend .env file
BACKEND_URL = "https://3d4d13a0-5810-4563-be05-e6c43367918e.preview.emergentagent.com/api"

class HPDBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_authentication(self):
        """Test authentication endpoint with correct and incorrect passwords"""
        print("\n=== Testing Authentication System ===")
        
        # Test correct password
        try:
            response = self.session.post(
                f"{self.base_url}/auth",
                json={"password": "HPD0909"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("authenticated") == True:
                    self.log_test("Auth - Correct Password", True, "Authentication successful with HPD0909")
                else:
                    self.log_test("Auth - Correct Password", False, "Authentication failed - wrong response format", data)
            else:
                self.log_test("Auth - Correct Password", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Auth - Correct Password", False, f"Request failed: {str(e)}")
        
        # Test incorrect password
        try:
            response = self.session.post(
                f"{self.base_url}/auth",
                json={"password": "wrong_password"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 401:
                self.log_test("Auth - Wrong Password", True, "Correctly rejected wrong password")
            else:
                self.log_test("Auth - Wrong Password", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Auth - Wrong Password", False, f"Request failed: {str(e)}")
    
    def test_wash_registration_crud(self):
        """Test wash registration CRUD operations"""
        print("\n=== Testing Wash Registration CRUD ===")
        
        # Test data with realistic Portuguese values
        wash_data = {
            "data": datetime.now().strftime("%Y-%m-%d"),
            "tipo_veiculo": "Cisterna",
            "area_negocio": "Alimentar", 
            "lavador": "Anfílófio Sousa",
            "tipo_lavagem": "Interior Cisterna + Conjunto",
            "empresa_tipo": "interna",
            "empresa_nome": "HPD Transportes",
            "matricula_trator": "12-AB-34",
            "matricula_reboque": "56-CD-78",
            "valor": 85.50,
            "observacoes": "Lavagem completa com desinfecção"
        }
        
        created_wash_id = None
        
        # Test POST /api/lavagens
        try:
            response = self.session.post(
                f"{self.base_url}/lavagens",
                json=wash_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                created_wash_id = data.get("id")
                if created_wash_id and all(key in data for key in wash_data.keys()):
                    self.log_test("Wash CRUD - Create", True, "Successfully created wash registration")
                else:
                    self.log_test("Wash CRUD - Create", False, "Missing fields in response", data)
            else:
                self.log_test("Wash CRUD - Create", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Wash CRUD - Create", False, f"Request failed: {str(e)}")
        
        # Test GET /api/lavagens
        try:
            response = self.session.get(f"{self.base_url}/lavagens")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Wash CRUD - Get All", True, f"Retrieved {len(data)} wash records")
                else:
                    self.log_test("Wash CRUD - Get All", False, "Response is not a list", data)
            else:
                self.log_test("Wash CRUD - Get All", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Wash CRUD - Get All", False, f"Request failed: {str(e)}")
        
        # Test DELETE /api/lavagens/{wash_id}
        if created_wash_id:
            try:
                response = self.session.delete(f"{self.base_url}/lavagens/{created_wash_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if "message" in data:
                        self.log_test("Wash CRUD - Delete", True, "Successfully deleted wash record")
                    else:
                        self.log_test("Wash CRUD - Delete", False, "Missing success message", data)
                else:
                    self.log_test("Wash CRUD - Delete", False, f"HTTP {response.status_code}", response.text)
                    
            except Exception as e:
                self.log_test("Wash CRUD - Delete", False, f"Request failed: {str(e)}")
    
    def test_daily_washes(self):
        """Test daily washes endpoint"""
        print("\n=== Testing Daily Washes Endpoint ===")
        
        # First create a wash for today
        today_wash = {
            "data": datetime.now().strftime("%Y-%m-%d"),
            "tipo_veiculo": "Frigorífico",
            "area_negocio": "Energia",
            "lavador": "Bruno Lourenço", 
            "tipo_lavagem": "Exterior Conjunto",
            "empresa_tipo": "externa",
            "empresa_nome": "Transportes Silva",
            "matricula_trator": "90-EF-12",
            "matricula_reboque": "",
            "valor": 45.00,
            "observacoes": "Lavagem exterior apenas"
        }
        
        # Create today's wash
        try:
            create_response = self.session.post(
                f"{self.base_url}/lavagens",
                json=today_wash,
                headers={"Content-Type": "application/json"}
            )
            created_wash_id = None
            if create_response.status_code == 200:
                created_wash_id = create_response.json().get("id")
        except:
            pass
        
        # Test GET /api/lavagens/today
        try:
            response = self.session.get(f"{self.base_url}/lavagens/today")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    today_count = len(data)
                    self.log_test("Daily Washes", True, f"Retrieved {today_count} washes for today")
                else:
                    self.log_test("Daily Washes", False, "Response is not a list", data)
            else:
                self.log_test("Daily Washes", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Daily Washes", False, f"Request failed: {str(e)}")
        
        # Cleanup
        if created_wash_id:
            try:
                self.session.delete(f"{self.base_url}/lavagens/{created_wash_id}")
            except:
                pass
    
    def test_monthly_washes(self):
        """Test monthly washes endpoint"""
        print("\n=== Testing Monthly Washes Endpoint ===")
        
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        try:
            response = self.session.get(f"{self.base_url}/lavagens/month/{current_year}/{current_month}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    month_count = len(data)
                    self.log_test("Monthly Washes", True, f"Retrieved {month_count} washes for {current_month}/{current_year}")
                else:
                    self.log_test("Monthly Washes", False, "Response is not a list", data)
            else:
                self.log_test("Monthly Washes", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Monthly Washes", False, f"Request failed: {str(e)}")
    
    def test_custom_washers(self):
        """Test custom washers management"""
        print("\n=== Testing Custom Washers Management ===")
        
        washer_data = {"nome": "Carlos Mendes"}
        
        # Test POST /api/lavadores
        try:
            response = self.session.post(
                f"{self.base_url}/lavadores",
                json=washer_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("nome") == washer_data["nome"] and "id" in data:
                    self.log_test("Custom Washers - Create", True, "Successfully added custom washer")
                else:
                    self.log_test("Custom Washers - Create", False, "Missing fields in response", data)
            else:
                self.log_test("Custom Washers - Create", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Custom Washers - Create", False, f"Request failed: {str(e)}")
        
        # Test GET /api/lavadores
        try:
            response = self.session.get(f"{self.base_url}/lavadores")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    washers_count = len(data)
                    self.log_test("Custom Washers - Get All", True, f"Retrieved {washers_count} custom washers")
                else:
                    self.log_test("Custom Washers - Get All", False, "Response is not a list", data)
            else:
                self.log_test("Custom Washers - Get All", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Custom Washers - Get All", False, f"Request failed: {str(e)}")
    
    def test_external_companies(self):
        """Test external companies management"""
        print("\n=== Testing External Companies Management ===")
        
        company_data = {"nome": "Transportes Atlântico Lda"}
        
        # Test POST /api/empresas-externas
        try:
            response = self.session.post(
                f"{self.base_url}/empresas-externas",
                json=company_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("nome") == company_data["nome"] and "id" in data:
                    self.log_test("External Companies - Create", True, "Successfully added external company")
                else:
                    self.log_test("External Companies - Create", False, "Missing fields in response", data)
            else:
                self.log_test("External Companies - Create", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("External Companies - Create", False, f"Request failed: {str(e)}")
        
        # Test GET /api/empresas-externas
        try:
            response = self.session.get(f"{self.base_url}/empresas-externas")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    companies_count = len(data)
                    self.log_test("External Companies - Get All", True, f"Retrieved {companies_count} external companies")
                else:
                    self.log_test("External Companies - Get All", False, "Response is not a list", data)
            else:
                self.log_test("External Companies - Get All", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("External Companies - Get All", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting HPD Backend Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests in priority order (high priority first)
        self.test_authentication()
        self.test_wash_registration_crud()
        self.test_daily_washes()
        self.test_monthly_washes()
        self.test_custom_washers()
        self.test_external_companies()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = HPDBackendTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(0 if failed == 0 else 1)