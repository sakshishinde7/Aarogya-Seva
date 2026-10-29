def test_dashboard_stats(client, auth_headers):
    headers = auth_headers("admin")
    response = client.get("/api/v1/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_patients" in data
    assert "new_patients_this_month" in data
    assert "vaccinations_completed" in data
    assert "vaccinations_upcoming" in data
    assert "age_distribution" in data
    assert "vaccination_trends" in data
    assert "disease_distribution" in data
    assert "followup_status_summary" in data
    assert isinstance(data["age_distribution"], list)


def test_reports_summary_and_csv_export(client, auth_headers):
    headers = auth_headers("admin")

    # 1. Summary endpoint
    sum_res = client.get("/api/v1/reports/summary", headers=headers)
    assert sum_res.status_code == 200
    data = sum_res.json()
    assert "total_patients" in data
    assert "total_vaccinations" in data

    # 2. CSV export endpoint
    export_res = client.get("/api/v1/reports/export?report_type=patients", headers=headers)
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers.get("content-type", "")
    assert "attachment" in export_res.headers.get("content-disposition", "")


def test_audit_logs(client, auth_headers):
    headers = auth_headers("admin")
    response = client.get("/api/v1/audit", headers=headers)
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)

