"""
Pytest configuration for StockSense Selenium tests.
Generates HTML reports with screenshots on failure.
"""
import pytest
from datetime import datetime


def pytest_html_report_title(report):
    report.title = "StockSense — Selenium Test Report"


def pytest_configure(config):
    config._metadata = {
        "Project": "StockSense — Stock Maintenance System",
        "Tester": "Automated (Selenium)",
        "Base URL": "http://localhost:3000",
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


@pytest.hookimpl(optionalhook=True)
def pytest_metadata(metadata):
    metadata.pop("Plugins", None)
