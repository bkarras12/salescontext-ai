import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from agents.input_handler import normalize_input


def test_strips_www():
    result = normalize_input(domain="www.acme.com")
    assert result["domain"] == "acme.com"


def test_strips_https():
    result = normalize_input(domain="https://acme.com")
    assert result["domain"] == "acme.com"


def test_strips_trailing_slash():
    result = normalize_input(domain="acme.com/")
    assert result["domain"] == "acme.com"


def test_lowercases():
    result = normalize_input(domain="ACME.COM")
    assert result["domain"] == "acme.com"


def test_company_name_passthrough():
    result = normalize_input(company_name="Acme Corp", domain="acme.com")
    assert result["company_name"] == "Acme Corp"
    assert result["domain"] == "acme.com"


def test_company_name_only():
    result = normalize_input(company_name="Acme Corp")
    assert result["company_name"] == "Acme Corp"
    assert result["domain"] == ""


def test_requires_some_input():
    with pytest.raises(ValueError):
        normalize_input()
