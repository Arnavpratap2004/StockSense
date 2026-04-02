import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from PIL import Image

def generate_pdf_report():
    print("Setting up headless Chrome...")
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    
    base_url = "http://localhost:3000"
    screenshots = []
    
    # Create temp dir for screenshots
    temp_dir = "temp_screenshots"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    try:
        # 1. Login Page
        print("Visiting Login...")
        driver.get(f"{base_url}/login")
        time.sleep(2)
        login_ss = os.path.join(temp_dir, "01_login.png")
        driver.save_screenshot(login_ss)
        screenshots.append(login_ss)
        
        # Click Demo Admin login
        print("Logging in as Admin...")
        driver.find_element(By.XPATH, "//button[contains(text(), 'Admin')]").click()
        
        # Wait for dashboard to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='dashboard-page']"))
        )
        time.sleep(3) # Extra wait for charts
        
        routes = [
            ("02_dashboard", "/dashboard"),
            ("03_inventory", "/inventory"),
            ("04_transactions", "/transactions"),
            ("05_reports", "/reports"),
            ("06_users", "/users"),
            ("07_audit_logs", "/audit-logs")
        ]
        
        for name, path in routes:
            print(f"Visiting {path}...")
            driver.get(f"{base_url}{path}")
            time.sleep(4) # Wait for network requests/renders
            
            # Special wait for reports page so we can fetch real layouts
            if path == "/reports":
                try:
                    driver.find_element(By.CSS_SELECTOR, "[data-testid='report-type-inventory']").click()
                    driver.find_element(By.CSS_SELECTOR, "[data-testid='generate-report-btn']").click()
                    time.sleep(3)
                except Exception as e:
                    pass
            
            ss_path = os.path.join(temp_dir, f"{name}.png")
            driver.save_screenshot(ss_path)
            screenshots.append(ss_path)
            
        print("Creating PDF...")
        # Open first image
        images = [Image.open(x).convert('RGB') for x in screenshots]
        
        pdf_path = "StockSense_App_Tour.pdf"
        if len(images) > 0:
            images[0].save(
                pdf_path,
                save_all=True,
                append_images=images[1:],
                resolution=100.0
            )
            print(f"✅ PDF Successfully saved at: {os.path.abspath(pdf_path)}")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        
    finally:
        driver.quit()
        # Clean up screenshots
        for file in os.listdir(temp_dir):
            os.remove(os.path.join(temp_dir, file))
        os.rmdir(temp_dir)

if __name__ == "__main__":
    generate_pdf_report()
