import datetime


def test_vaccination_workflow(client, auth_headers, seed_catalog):
    headers = auth_headers("worker")
    vaccine_id = seed_catalog["vaccine"].id

    # 1. Register a test child patient
    pat_res = client.post(
        "/api/v1/patients",
        json={
            "full_name": "Baby of Sunita",
            "date_of_birth": "2024-08-01",
            "sex": "Female",
            "village_locality": "Wai",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )
    patient_id = pat_res.json()["id"]

    # 2. Record vaccination schedule
    today_str = datetime.date.today().isoformat()
    vax_res = client.post(
        "/api/v1/vaccines/records",
        json={
            "patient_id": patient_id,
            "vaccine_id": vaccine_id,
            "dose_number": 1,
            "status": "Scheduled",
            "scheduled_date": today_str,
            "notes": "First BCG dose scheduled",
        },
        headers=headers,
    )
    assert vax_res.status_code == 201
    record_id = vax_res.json()["id"]

    # 3. Mark completed by authorized worker
    complete_res = client.put(
        f"/api/v1/vaccines/records/{record_id}",
        json={
            "status": "Completed",
            "administration_date": today_str,
            "batch_number": "BCG-2026-X12",
        },
        headers=headers,
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "Completed"
    assert complete_res.json()["administration_date"] == today_str


def test_disease_and_followup_workflow(client, auth_headers, seed_catalog):
    headers = auth_headers("worker")
    category_id = seed_catalog["category"].id

    # 1. Register patient
    pat_res = client.post(
        "/api/v1/patients",
        json={
            "full_name": "Nitin Vasant More",
            "date_of_birth": "1982-06-18",
            "sex": "Male",
            "village_locality": "Patan",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )
    patient_id = pat_res.json()["id"]

    # 2. Record suspected disease case
    today_str = datetime.date.today().isoformat()
    disease_res = client.post(
        "/api/v1/diseases/records",
        json={
            "patient_id": patient_id,
            "category_id": category_id,
            "clinical_status": "Suspected",
            "workflow_status": "Follow-up Required",
            "reported_date": today_str,
            "symptoms_notes": "High fever, chills, body ache",
            "follow_up_due_date": today_str,
        },
        headers=headers,
    )
    assert disease_res.status_code == 201
    disease_id = disease_res.json()["id"]

    # 3. Schedule follow-up
    fu_res = client.post(
        "/api/v1/followups",
        json={
            "patient_id": patient_id,
            "module_type": "Disease",
            "related_record_id": disease_id,
            "due_date": today_str,
            "priority": "High",
            "purpose": "Post-fever blood test check",
            "status": "Pending",
        },
        headers=headers,
    )
    assert fu_res.status_code == 201
    fu_id = fu_res.json()["id"]

    # 4. Mark follow-up completed
    update_fu = client.put(
        f"/api/v1/followups/{fu_id}",
        json={
            "status": "Completed",
            "resolution_notes": "Platelet count normal. Fever resolved.",
        },
        headers=headers,
    )
    assert update_fu.status_code == 200
    assert update_fu.json()["status"] == "Completed"

