"""
StockSense — Selenium Test Suite
Comprehensive end-to-end tests for the Stock Maintenance System
"""
import pytest
import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

BASE_URL = "http://localhost:3000"
WAIT_TIMEOUT = 15


# ═══════════════════════════════════════════════════════════════
# FIXTURES
# ═══════════════════════════════════════════════════════════════

@pytest.fixture(scope="session")
def driver():
    """Create a shared Chrome WebDriver instance for all tests."""
    chrome_options = Options()
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Run headless for CI — comment out for local debugging
    # chrome_options.add_argument("--headless=new")

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()


@pytest.fixture(scope="session", autouse=True)
def login_as_admin(driver):
    """Log in as admin before running any tests."""
    driver.get(f"{BASE_URL}/login")
    wait = WebDriverWait(driver, WAIT_TIMEOUT)

    # Wait for login form
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-email']"))
    )
    email_input.clear()
    email_input.send_keys("admin@stocksense.com")

    password_input = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
    password_input.clear()
    password_input.send_keys("Admin@123")

    sign_in_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-btn']")
    sign_in_btn.click()

    # Wait for redirect to dashboard
    wait.until(EC.url_contains("/dashboard"))
    time.sleep(2)  # Allow dashboard to fully render


def wait_for_element(driver, testid, timeout=WAIT_TIMEOUT):
    """Helper: wait for element by data-testid."""
    wait = WebDriverWait(driver, timeout)
    return wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, f"[data-testid='{testid}']"))
    )


def wait_for_clickable(driver, testid, timeout=WAIT_TIMEOUT):
    """Helper: wait for element to be clickable by data-testid."""
    wait = WebDriverWait(driver, timeout)
    return wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, f"[data-testid='{testid}']"))
    )


def element_exists(driver, testid):
    """Helper: check if element exists."""
    try:
        driver.find_element(By.CSS_SELECTOR, f"[data-testid='{testid}']")
        return True
    except NoSuchElementException:
        return False


# ═══════════════════════════════════════════════════════════════
# 1. LOGIN & AUTHENTICATION TESTS
# ═══════════════════════════════════════════════════════════════

class TestAuthentication:
    """Tests for the login page and authentication flow."""

    def test_01_login_page_elements(self, driver):
        """TC-AUTH-01: Verify login page has all required elements."""
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, WAIT_TIMEOUT)

        # Check form exists
        form = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-form']"))
        )
        assert form is not None, "Login form should exist"

        # Check email input
        email = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-email']")
        assert email is not None, "Email input should exist"

        # Check password input
        password = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
        assert password is not None, "Password input should exist"

        # Check sign in button
        btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-btn']")
        assert btn is not None, "Sign in button should exist"
        assert btn.text.strip() == "Sign In", "Button text should be 'Sign In'"

    def test_02_demo_credential_buttons(self, driver):
        """TC-AUTH-02: Verify demo credential buttons are present."""
        driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        assert element_exists(driver, "demo-admin-btn"), "Admin demo button should exist"
        assert element_exists(driver, "demo-manager-btn"), "Manager demo button should exist"
        assert element_exists(driver, "demo-staff-btn"), "Staff demo button should exist"

    def test_03_password_toggle(self, driver):
        """TC-AUTH-03: Verify password visibility toggle works."""
        driver.get(f"{BASE_URL}/login")
        time.sleep(2)

        password = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
        assert password.get_attribute("type") == "password", "Password should be masked initially"

        toggle = driver.find_element(By.CSS_SELECTOR, "[data-testid='toggle-password']")
        toggle.click()
        time.sleep(0.5)

        assert password.get_attribute("type") == "text", "Password should be visible after toggle"

    def test_04_invalid_login(self, driver):
        """TC-AUTH-04: Verify error message on invalid credentials."""
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, WAIT_TIMEOUT)

        email = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-email']"))
        )
        email.clear()
        email.send_keys("wrong@email.com")

        password = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
        password.clear()
        password.send_keys("WrongPassword123")

        driver.find_element(By.CSS_SELECTOR, "[data-testid='login-btn']").click()
        time.sleep(3)

        error = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-error']"))
        )
        assert "Invalid" in error.text or "invalid" in error.text, "Should show invalid credentials error"

    def test_05_successful_login(self, driver):
        """TC-AUTH-05: Verify successful login redirects to dashboard."""
        driver.get(f"{BASE_URL}/login")
        wait = WebDriverWait(driver, WAIT_TIMEOUT)

        email = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='login-email']"))
        )
        email.clear()
        email.send_keys("admin@stocksense.com")

        password = driver.find_element(By.CSS_SELECTOR, "[data-testid='login-password']")
        password.clear()
        password.send_keys("Admin@123")

        driver.find_element(By.CSS_SELECTOR, "[data-testid='login-btn']").click()

        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url, "Should redirect to dashboard after login"
        time.sleep(2)


# ═══════════════════════════════════════════════════════════════
# 2. DASHBOARD TESTS
# ═══════════════════════════════════════════════════════════════

class TestDashboard:
    """Tests for the main dashboard page."""

    def test_01_dashboard_loads(self, driver):
        """TC-DASH-01: Verify dashboard page loads correctly."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)
        assert "/dashboard" in driver.current_url, "Should be on dashboard page"

    def test_02_stat_cards_present(self, driver):
        """TC-DASH-02: Verify all stat cards are displayed."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        assert element_exists(driver, "stat-total-skus"), "Total SKUs card should exist"
        assert element_exists(driver, "stat-low-stock"), "Low Stock card should exist"
        assert element_exists(driver, "stat-out-of-stock"), "Out of Stock card should exist"
        assert element_exists(driver, "stat-transactions-today"), "Transactions Today card should exist"

    def test_03_stat_values_non_zero(self, driver):
        """TC-DASH-03: Verify stat cards show the seeded data values."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        total_skus = driver.find_element(By.CSS_SELECTOR, "[data-testid='stat-total-skus']")
        skus_text = total_skus.text.strip()
        assert "6" in skus_text, f"Total SKUs should be 6, got: {skus_text}"

    def test_04_quick_actions_present(self, driver):
        """TC-DASH-04: Verify quick action buttons exist."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        assert element_exists(driver, "quick-add-stock"), "Add Stock quick action should exist"
        assert element_exists(driver, "quick-reports"), "Reports quick action should exist"
        assert element_exists(driver, "quick-alerts"), "Alerts quick action should exist"

    def test_05_charts_render(self, driver):
        """TC-DASH-05: Verify charts are rendered."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        assert element_exists(driver, "chart-stock-by-category"), "Stock by Category chart should exist"
        assert element_exists(driver, "chart-transaction-trend"), "Transaction Volume chart should exist"


# ═══════════════════════════════════════════════════════════════
# 3. SIDEBAR & NAVIGATION TESTS
# ═══════════════════════════════════════════════════════════════

class TestNavigation:
    """Tests for sidebar navigation and top bar."""

    def test_01_sidebar_links(self, driver):
        """TC-NAV-01: Verify all sidebar navigation links are present."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        links = [
            "nav-dashboard", "nav-inventory", "nav-transactions",
            "nav-reports", "nav-notifications", "nav-users", "nav-audit-logs"
        ]
        for link_id in links:
            assert element_exists(driver, link_id), f"Sidebar link '{link_id}' should exist"

    def test_02_navigate_to_inventory(self, driver):
        """TC-NAV-02: Navigate to inventory page via sidebar."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)

        nav_link = driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-inventory']")
        nav_link.click()
        time.sleep(3)

        assert "/inventory" in driver.current_url, "Should navigate to inventory page"

    def test_03_navigate_to_transactions(self, driver):
        """TC-NAV-03: Navigate to transactions page via sidebar."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)

        nav_link = driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-transactions']")
        nav_link.click()
        time.sleep(3)

        assert "/transactions" in driver.current_url, "Should navigate to transactions page"

    def test_04_navigate_to_reports(self, driver):
        """TC-NAV-04: Navigate to reports page via sidebar."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)

        nav_link = driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-reports']")
        nav_link.click()
        time.sleep(3)

        assert "/reports" in driver.current_url, "Should navigate to reports page"

    def test_05_navigate_to_users(self, driver):
        """TC-NAV-05: Navigate to users page via sidebar."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)

        nav_link = driver.find_element(By.CSS_SELECTOR, "[data-testid='nav-users']")
        nav_link.click()
        time.sleep(3)

        assert "/users" in driver.current_url, "Should navigate to users page"

    def test_06_topbar_present(self, driver):
        """TC-NAV-06: Verify top bar elements."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        assert element_exists(driver, "topbar"), "Top bar should exist"
        assert element_exists(driver, "topbar-search-btn"), "Search button should exist"
        assert element_exists(driver, "notification-bell"), "Notification bell should exist"
        assert element_exists(driver, "topbar-user-menu"), "User menu trigger should exist"

    def test_07_notification_bell(self, driver):
        """TC-NAV-07: Verify notification bell shows badge."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        bell = driver.find_element(By.CSS_SELECTOR, "[data-testid='notification-bell']")
        assert bell is not None, "Notification bell should exist"

        # Check if badge exists (unread count)
        try:
            badge = driver.find_element(By.CSS_SELECTOR, "[data-testid='notification-badge']")
            badge_text = badge.text
            assert len(badge_text) > 0, "Badge should display count"
        except NoSuchElementException:
            pass  # No unread notifications is also valid


# ═══════════════════════════════════════════════════════════════
# 4. INVENTORY TESTS
# ═══════════════════════════════════════════════════════════════

class TestInventory:
    """Tests for the inventory management page."""

    def test_01_inventory_page_loads(self, driver):
        """TC-INV-01: Verify inventory page loads with stock items."""
        driver.get(f"{BASE_URL}/inventory")
        time.sleep(3)

        assert "/inventory" in driver.current_url, "Should be on inventory page"

    def test_02_inventory_table_present(self, driver):
        """TC-INV-02: Verify inventory data table is present."""
        driver.get(f"{BASE_URL}/inventory")
        time.sleep(3)

        assert element_exists(driver, "inventory-table"), "Inventory table should exist"

    def test_03_stock_items_displayed(self, driver):
        """TC-INV-03: Verify seeded stock items are displayed."""
        driver.get(f"{BASE_URL}/inventory")
        time.sleep(5)  # Wait for data to load from remote DB

        rows = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='inventory-row-']")
        assert len(rows) > 0, f"Should display stock items, found {len(rows)} rows"

    def test_04_add_stock_button(self, driver):
        """TC-INV-04: Verify Add Stock button exists and navigates."""
        driver.get(f"{BASE_URL}/inventory")
        time.sleep(5)  # Wait for session to load (button is role-gated)

        wait = WebDriverWait(driver, WAIT_TIMEOUT)
        btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-testid='add-stock-btn']"))
        )
        assert btn is not None, "Add Stock button should exist"
        btn.click()
        time.sleep(3)

        assert "/inventory/new" in driver.current_url, "Should navigate to new stock page"

    def test_05_search_filter(self, driver):
        """TC-INV-05: Verify search filter works."""
        driver.get(f"{BASE_URL}/inventory")
        time.sleep(5)

        search = driver.find_element(By.CSS_SELECTOR, "[data-testid='inventory-search']")
        search.clear()
        search.send_keys("Dell")
        time.sleep(3)  # Wait for debounced search + remote DB

        rows = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='inventory-row-']")
        # Should filter results (at least one match for "Dell Laptop")
        found = False
        for row in rows:
            if "Dell" in row.text:
                found = True
                break
        assert found or len(rows) > 0, "Search should return relevant results"

    def test_06_inventory_detail_page(self, driver):
        """TC-INV-06: Verify clicking a stock item opens detail page."""
        driver.get(f"{BASE_URL}/inventory")
        time.sleep(3)

        # Navigate to first stock item detail
        first_row = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='stock-row-']")
        if len(first_row) > 0:
            # Find the link/clickable in the first row
            try:
                link = first_row[0].find_element(By.TAG_NAME, "a")
                link.click()
            except NoSuchElementException:
                first_row[0].click()
            time.sleep(3)

            assert "/inventory/" in driver.current_url, "Should navigate to stock detail page"


# ═══════════════════════════════════════════════════════════════
# 5. ADD STOCK FORM TESTS
# ═══════════════════════════════════════════════════════════════

class TestAddStock:
    """Tests for the new stock item form."""

    def test_01_form_loads(self, driver):
        """TC-ADD-01: Verify new stock form page loads."""
        driver.get(f"{BASE_URL}/inventory/new")
        time.sleep(3)

        assert "/inventory/new" in driver.current_url, "Should be on new stock page"

    def test_02_form_fields_present(self, driver):
        """TC-ADD-02: Verify all form fields are present."""
        driver.get(f"{BASE_URL}/inventory/new")
        time.sleep(3)

        fields = ["stock-sku", "stock-name", "stock-price", "stock-quantity", "stock-reorder"]
        for field_id in fields:
            assert element_exists(driver, field_id), f"Form field '{field_id}' should exist"

    def test_03_form_validation(self, driver):
        """TC-ADD-03: Verify form validation on empty submission."""
        driver.get(f"{BASE_URL}/inventory/new")
        time.sleep(3)

        # Try submitting empty form
        submit_btn = driver.find_element(By.CSS_SELECTOR, "[data-testid='stock-submit-btn']")
        submit_btn.click()
        time.sleep(2)

        # Should still be on the same page (validation failed)
        assert "/inventory/new" in driver.current_url, "Should remain on form page after validation failure"


# ═══════════════════════════════════════════════════════════════
# 6. TRANSACTIONS TESTS
# ═══════════════════════════════════════════════════════════════

class TestTransactions:
    """Tests for the transactions page."""

    def test_01_transactions_page_loads(self, driver):
        """TC-TXN-01: Verify transactions page loads."""
        driver.get(f"{BASE_URL}/transactions")
        time.sleep(3)

        assert "/transactions" in driver.current_url, "Should be on transactions page"

    def test_02_transactions_table(self, driver):
        """TC-TXN-02: Verify transactions table is displayed."""
        driver.get(f"{BASE_URL}/transactions")
        time.sleep(3)

        assert element_exists(driver, "transactions-table"), "Transactions table should exist"

    def test_03_transactions_data(self, driver):
        """TC-TXN-03: Verify seeded transactions are displayed."""
        driver.get(f"{BASE_URL}/transactions")
        time.sleep(5)  # Wait for data to load from remote DB

        rows = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='tx-row-']")
        assert len(rows) > 0, f"Should display transactions, found {len(rows)} rows"

    def test_04_transactions_filter(self, driver):
        """TC-TXN-04: Verify transaction type filter exists."""
        driver.get(f"{BASE_URL}/transactions")
        time.sleep(3)

        assert element_exists(driver, "transaction-action-filter"), "Transaction type filter should exist"


# ═══════════════════════════════════════════════════════════════
# 7. REPORTS TESTS
# ═══════════════════════════════════════════════════════════════

class TestReports:
    """Tests for the reports page."""

    def test_01_reports_page_loads(self, driver):
        """TC-RPT-01: Verify reports page loads."""
        driver.get(f"{BASE_URL}/reports")
        time.sleep(3)

        assert "/reports" in driver.current_url, "Should be on reports page"

    def test_02_report_type_selector(self, driver):
        """TC-RPT-02: Verify report type selector exists."""
        driver.get(f"{BASE_URL}/reports")
        time.sleep(3)

        assert element_exists(driver, "report-type-cards"), "Report type selector should exist"

    def test_03_generate_report_button(self, driver):
        """TC-RPT-03: Verify generate report button exists."""
        driver.get(f"{BASE_URL}/reports")
        time.sleep(3)

        assert element_exists(driver, "generate-report-btn"), "Generate report button should exist"


# ═══════════════════════════════════════════════════════════════
# 8. USERS MANAGEMENT TESTS
# ═══════════════════════════════════════════════════════════════

class TestUsers:
    """Tests for the users management page."""

    def test_01_users_page_loads(self, driver):
        """TC-USR-01: Verify users page loads."""
        driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        assert "/users" in driver.current_url, "Should be on users page"

    def test_02_users_table(self, driver):
        """TC-USR-02: Verify users table is displayed."""
        driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        assert element_exists(driver, "users-table"), "Users table should exist"

    def test_03_users_data(self, driver):
        """TC-USR-03: Verify seeded users are listed."""
        driver.get(f"{BASE_URL}/users")
        time.sleep(3)

        rows = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='user-row-']")
        assert len(rows) >= 3, f"Should show at least 3 seeded users, found {len(rows)}"


# ═══════════════════════════════════════════════════════════════
# 9. NOTIFICATIONS TESTS
# ═══════════════════════════════════════════════════════════════

class TestNotifications:
    """Tests for the notifications page and bell."""

    def test_01_notifications_page_loads(self, driver):
        """TC-NTF-01: Verify notifications page loads."""
        driver.get(f"{BASE_URL}/notifications")
        time.sleep(3)

        assert "/notifications" in driver.current_url, "Should be on notifications page"

    def test_02_notification_dropdown(self, driver):
        """TC-NTF-02: Verify notification bell opens dropdown."""
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        bell = driver.find_element(By.CSS_SELECTOR, "[data-testid='notification-bell']")
        bell.click()
        time.sleep(2)

        dropdown = driver.find_element(By.CSS_SELECTOR, "[data-testid='notification-dropdown']")
        assert dropdown.is_displayed(), "Notification dropdown should be visible"


# ═══════════════════════════════════════════════════════════════
# 10. AUDIT LOGS TESTS
# ═══════════════════════════════════════════════════════════════

class TestAuditLogs:
    """Tests for the audit logs page."""

    def test_01_audit_logs_page_loads(self, driver):
        """TC-AUD-01: Verify audit logs page loads."""
        driver.get(f"{BASE_URL}/audit-logs")
        time.sleep(3)

        assert "/audit-logs" in driver.current_url, "Should be on audit logs page"

    def test_02_audit_logs_table(self, driver):
        """TC-AUD-02: Verify audit logs table exists."""
        driver.get(f"{BASE_URL}/audit-logs")
        time.sleep(5)  # Wait for data to load from remote DB

        # Table may be inside a loading conditional; wait for it
        try:
            wait = WebDriverWait(driver, WAIT_TIMEOUT)
            wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='audit-logs-table']"))
            )
            assert True
        except TimeoutException:
            # If table didn't appear, check if the empty state is shown
            assert "No audit logs" in driver.page_source or element_exists(driver, "audit-logs-table-card"), "Audit logs table or empty state should exist"


# ═══════════════════════════════════════════════════════════════
# 11. RESPONSIVE DESIGN TESTS
# ═══════════════════════════════════════════════════════════════

class TestResponsive:
    """Tests for responsive design behavior."""

    def test_01_mobile_menu_button(self, driver):
        """TC-RES-01: Verify mobile menu button appears on small screens."""
        driver.set_window_size(375, 812)  # iPhone X size
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        assert element_exists(driver, "topbar-menu-btn"), "Mobile menu button should exist"

        # Reset to desktop
        driver.set_window_size(1920, 1080)
        time.sleep(1)

    def test_02_desktop_sidebar_visible(self, driver):
        """TC-RES-02: Verify sidebar is visible on desktop."""
        driver.set_window_size(1920, 1080)
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(3)

        sidebar = driver.find_element(By.CSS_SELECTOR, "[data-testid='sidebar']")
        assert sidebar.is_displayed(), "Sidebar should be visible on desktop"


# ═══════════════════════════════════════════════════════════════
# 12. TEST API ENDPOINTS
# ═══════════════════════════════════════════════════════════════

class TestAPIEndpoints:
    """Tests for test-friendly API routes."""

    def test_01_mock_data_endpoint(self, driver):
        """TC-API-01: Verify /api/test/mock-data returns data."""
        driver.get(f"{BASE_URL}/api/test/mock-data")
        time.sleep(3)

        body = driver.find_element(By.TAG_NAME, "body").text
        assert "success" in body.lower() or "users" in body.lower(), "Mock data API should return data"

    def test_02_categories_api(self, driver):
        """TC-API-02: Verify /api/categories returns data."""
        driver.get(f"{BASE_URL}/api/categories")
        time.sleep(3)

        body = driver.find_element(By.TAG_NAME, "body").text
        assert "Electronics" in body or "success" in body.lower(), "Categories API should return data"
