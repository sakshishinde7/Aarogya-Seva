def test_create_patient_by_worker(client, auth_headers):
    headers = auth_headers("worker")
    payload = {
        "full_name": "Aarav Santosh Shinde",
        "date_of_birth": "2024-03-15",
        "sex": "Male",
        "village_locality": "Bhilawadi",
        "district": "Satara",
        "state": "Maharashtra",
        "contact_number": "+91 98221 00112",
        "emergency_contact_name": "Santosh Shinde",
        "emergency_contact_phone": "+91 98221 00113",
        "emergency_contact_relation": "Father",
        "notes": "Routine rural child registration",
    }
    response = client.post("/api/v1/patients", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Aarav Santosh Shinde"
    assert data["public_id"].startswith("AS-PAT-")
    assert data["village_locality"] == "Bhilawadi"
    assert data["age_years"] >= 0
    assert data["is_active"] is True


def test_create_patient_forbidden_for_supervisor(client, auth_headers):
    # Supervisor has view-only permissions by design
    headers = auth_headers("supervisor")
    payload = {
        "full_name": "Unauthorized Entry",
        "date_of_birth": "1990-01-01",
        "sex": "Female",
        "village_locality": "Wai",
        "district": "Satara",
        "state": "Maharashtra",
    }
    response = client.post("/api/v1/patients", json=payload, headers=headers)
    assert response.status_code == 403


def test_list_patients_and_search(client, auth_headers):
    headers = auth_headers("admin")

    # Register two patients
    client.post(
        "/api/v1/patients",
        json={
            "full_name": "Gita Ramesh Jadhav",
            "date_of_birth": "1995-07-20",
            "sex": "Female",
            "village_locality": "Pachwad",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )
    client.post(
        "/api/v1/patients",
        json={
            "full_name": "Kishore Pandurang Mane",
            "date_of_birth": "1958-11-05",
            "sex": "Male",
            "village_locality": "Shirwal",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )

    # Search for "Jadhav"
    search_res = client.get("/api/v1/patients?search=Jadhav", headers=headers)
    assert search_res.status_code == 200
    data = search_res.json()
    assert data["total"] >= 1
    assert any("Jadhav" in item["full_name"] for item in data["items"])


def test_check_duplicate_patient(client, auth_headers):
    headers = auth_headers("worker")
    client.post(
        "/api/v1/patients",
        json={
            "full_name": "Meena Dattatray Kadam",
            "date_of_birth": "1988-04-12",
            "sex": "Female",
            "village_locality": "Koregaon",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )

    # Duplicate check with exact same name, dob, village
    dup_res = client.post(
        "/api/v1/patients/check-duplicate?full_name=Meena Dattatray Kadam&date_of_birth=1988-04-12&village_locality=Koregaon",
        headers=headers,
    )
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["has_potential_duplicate"] is True
    assert len(dup_data["matches"]) >= 1


def test_get_patient_full_profile(client, auth_headers):
    headers = auth_headers("admin")
    create_res = client.post(
        "/api/v1/patients",
        json={
            "full_name": "Suresh Maruti Patil",
            "date_of_birth": "1952-09-14",
            "sex": "Male",
            "village_locality": "Medha",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )
    patient_id = create_res.json()["id"]

    profile_res = client.get(f"/api/v1/patients/{patient_id}/full-profile", headers=headers)
    assert profile_res.status_code == 200
    data = profile_res.json()
    assert data["patient"]["id"] == patient_id
    assert "vaccination_records" in data
    assert "disease_records" in data
    assert "followups" in data


def test_update_and_deactivate_patient(client, auth_headers):
    headers = auth_headers("admin")
    create_res = client.post(
        "/api/v1/patients",
        json={
            "full_name": "Laxman Rao Shinde",
            "date_of_birth": "1975-02-10",
            "sex": "Male",
            "village_locality": "Bhuinj",
            "district": "Satara",
            "state": "Maharashtra",
        },
        headers=headers,
    )
    patient_id = create_res.json()["id"]

    # Update village
    update_res = client.put(
        f"/api/v1/patients/{patient_id}",
        json={"village_locality": "Bhuinj North Ward"},
        headers=headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["village_locality"] == "Bhuinj North Ward"

    # Soft deactivate
    delete_res = client.delete(f"/api/v1/patients/{patient_id}", headers=headers)
    assert delete_res.status_code == 200

    # Ensure patient is now marked inactive
    get_res = client.get(f"/api/v1/patients/{patient_id}", headers=headers)
    assert get_res.json()["is_active"] is False

