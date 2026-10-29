import sys
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.security import hash_password
from app.models.user import User
from app.models.vaccine import Vaccine, VaccinationRecord
from app.models.disease import DiseaseCategory, DiseaseRecord
from app.models.patient import Patient
from app.models.healthcare import ChildRecord, MaternalRecord, ElderlyRecord, HealthcareVisit
from app.models.followup import FollowUp
from app.models.audit import AuditLog
from app.seeds.sample_data import SAMPLE_USERS, SAMPLE_VACCINES, SAMPLE_DISEASE_CATEGORIES


def seed_database(reset: bool = False):
    """Seed database deterministically and idempotently with realistic demonstration data."""
    if reset:
        print("[!] Resetting database tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("[OK] Database schema recreated.")
    else:
        Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 0 and not reset:
            print("[INFO] Database already contains records. Skipping seed to prevent duplication.")
            return

        print("[*] Seeding staff accounts...")
        user_map = {}
        for u in SAMPLE_USERS:
            user = User(
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                locality=u["locality"],
                phone=u["phone"],
                is_active=True
            )
            db.add(user)
            db.flush()
            user_map[u["role"]] = user
        db.commit()

        admin_user = user_map["administrator"]
        worker_user = user_map["worker"]
        supervisor_user = user_map["supervisor"]

        print("[*] Seeding vaccine catalogue...")
        vaccine_map = {}
        for v in SAMPLE_VACCINES:
            vaccine = Vaccine(
                code=v["code"],
                name=v["name"],
                target_disease=v["target_disease"],
                standard_doses=v["standard_doses"],
                recommended_age_days=v["recommended_age_days"],
                description=v["description"],
                is_active=True
            )
            db.add(vaccine)
            db.flush()
            vaccine_map[v["code"]] = vaccine
        db.commit()

        print("[*] Seeding disease surveillance categories...")
        cat_map = {}
        for c in SAMPLE_DISEASE_CATEGORIES:
            cat = DiseaseCategory(
                name=c["name"],
                description=c["description"],
                default_follow_up_days=c["default_follow_up_days"],
                is_active=True
            )
            db.add(cat)
            db.flush()
            cat_map[c["name"]] = cat
        db.commit()

        today = date.today()

        # ==========================================
        # 25 FICTIONAL DEMONSTRATION PATIENTS
        # ==========================================
        print("[*] Seeding unified patient registry and module records...")

        # 1. Child Patients (under 5)
        children_data = [
            ("AS-PAT-10101", "Aarav Sachin Deshmukh", today - timedelta(days=70), "Male", "Pachwad Village", "Satara", "Sachin Deshmukh", "Father", 3.2, 5.1, 58.0, 39.5, "Normal"),
            ("AS-PAT-10102", "Ananya Nitin Patil", today - timedelta(days=280), "Female", "Bhuinj Village", "Satara", "Pooja Patil", "Mother", 2.9, 7.8, 69.5, 43.0, "Normal"),
            ("AS-PAT-10103", "Reyansh Kiran More", today - timedelta(days=490), "Male", "Wai Gaon", "Satara", "Sunita More", "Mother", 2.6, 9.2, 77.0, 45.2, "Moderate Underweight"),
            ("AS-PAT-10104", "Sai Ganesh Jadhav", today - timedelta(days=40), "Male", "Shirwal Khurd", "Satara", "Ganesh Jadhav", "Father", 3.1, 4.3, 54.0, 37.8, "Normal"),
            ("AS-PAT-10105", "Ishita Deepak Shinde", today - timedelta(days=600), "Female", "Khed Shivapur", "Pune", "Deepak Shinde", "Father", 2.8, 10.4, 82.0, 46.5, "Normal"),
            ("AS-PAT-10106", "Advait Sandip Kadam", today - timedelta(days=15), "Male", "Chiplun Rural", "Ratnagiri", "Sandip Kadam", "Father", 3.0, 3.2, 50.0, 35.0, "Normal"),
        ]

        for pub_id, name, dob, sex, village, dist, g_name, g_rel, b_wt, c_wt, ht, hc, g_status in children_data:
            p = Patient(
                public_id=pub_id,
                full_name=name,
                date_of_birth=dob,
                sex=sex,
                village_locality=village,
                district=dist,
                state="Maharashtra",
                contact_number="+91 98811 " + str(pub_id[-5:]),
                emergency_contact_name=g_name,
                emergency_contact_phone="+91 98811 " + str(pub_id[-5:]),
                emergency_contact_relation=g_rel,
                assigned_worker_id=worker_user.id,
                notes=f"Pediatric growth tracking. Guardian: {g_name} ({g_rel})",
                is_active=True
            )
            db.add(p)
            db.flush()

            # Add child record
            cr = ChildRecord(
                patient_id=p.id,
                guardian_name=g_name,
                guardian_relation=g_rel,
                birth_weight_kg=b_wt,
                current_weight_kg=c_wt,
                height_cm=ht,
                head_circumference_cm=hc,
                growth_status=g_status,
                growth_observations="Active reflexes, normal milestone progress as per Anganwadi card."
            )
            db.add(cr)

            # Add child vaccinations
            db.add(VaccinationRecord(
                patient_id=p.id,
                vaccine_id=vaccine_map["BCG"].id,
                dose_number=1,
                status="Completed",
                scheduled_date=dob,
                administration_date=dob + timedelta(days=2),
                administered_by_worker_id=worker_user.id,
                batch_number="BCG-MH-2025-09",
                notes="Normal wheal noted at left deltoid insertion."
            ))
            db.add(VaccinationRecord(
                patient_id=p.id,
                vaccine_id=vaccine_map["OPV-0"].id,
                dose_number=1,
                status="Completed",
                scheduled_date=dob,
                administration_date=dob + timedelta(days=2),
                administered_by_worker_id=worker_user.id,
                batch_number="OPV-2025-41"
            ))

            if (today - dob).days >= 42:
                db.add(VaccinationRecord(
                    patient_id=p.id,
                    vaccine_id=vaccine_map["PENTA-1"].id,
                    dose_number=1,
                    status="Completed",
                    scheduled_date=dob + timedelta(days=42),
                    administration_date=dob + timedelta(days=44),
                    administered_by_worker_id=worker_user.id,
                    batch_number="PNT-602-B"
                ))

            # Upcoming/overdue schedule
            if (today - dob).days < 270 and (today - dob).days > 100:
                db.add(VaccinationRecord(
                    patient_id=p.id,
                    vaccine_id=vaccine_map["MR-1"].id,
                    dose_number=1,
                    status="Scheduled",
                    scheduled_date=dob + timedelta(days=270),
                    notes="Due at 9 months completion"
                ))

        # 2. Maternal Patients (Women 21-32 yrs)
        maternal_data = [
            ("AS-PAT-20201", "Pooja Rahul Shinde", today - timedelta(days=365 * 24), "Female", "Wai Gaon", "Satara", today - timedelta(days=120), today + timedelta(days=160), 2, 1, False, "", 2, 0),
            ("AS-PAT-20202", "Sneha Amit Pawar", today - timedelta(days=365 * 27), "Female", "Pachwad Village", "Satara", today - timedelta(days=210), today + timedelta(days=70), 1, 0, True, "Mild anaemia (Hb 9.2 g/dL), monitored weekly", 3, 0),
            ("AS-PAT-20203", "Kavita Sagar Jagtap", today - timedelta(days=365 * 29), "Female", "Bhuinj Village", "Satara", today - timedelta(days=60), today + timedelta(days=220), 3, 2, False, "", 1, 0),
            ("AS-PAT-20204", "Manjusha Vikas Ghadge", today - timedelta(days=365 * 23), "Female", "Shirwal Khurd", "Satara", today - timedelta(days=310), today - timedelta(days=30), 1, 1, False, "Postnatal lactation check and newborn care", 4, 2),
            ("AS-PAT-20205", "Rupali Santosh Sawant", today - timedelta(days=365 * 31), "Female", "Chiplun Rural", "Ratnagiri", today - timedelta(days=150), today + timedelta(days=130), 2, 1, False, "", 2, 0),
            ("AS-PAT-20206", "Ashwini Mahesh Nalawade", today - timedelta(days=365 * 26), "Female", "Baramati Gram", "Pune", today - timedelta(days=180), today + timedelta(days=100), 1, 0, True, "History of PIH; BP checked fortnightly", 3, 0),
        ]

        for pub_id, name, dob, sex, village, dist, lmp, edd, grav, par, hr_status, hr_notes, anc_cnt, pnc_cnt in maternal_data:
            p = Patient(
                public_id=pub_id,
                full_name=name,
                date_of_birth=dob,
                sex=sex,
                village_locality=village,
                district=dist,
                state="Maharashtra",
                contact_number="+91 97654 " + str(pub_id[-5:]),
                emergency_contact_name=f"{name.split()[1]} {name.split()[2]}",
                emergency_contact_phone="+91 97654 " + str(pub_id[-5:]),
                emergency_contact_relation="Husband",
                assigned_worker_id=worker_user.id,
                notes="Maternal health registration.",
                is_active=True
            )
            db.add(p)
            db.flush()

            mr = MaternalRecord(
                patient_id=p.id,
                lmp_date=lmp,
                edd_date=edd,
                gravidity=grav,
                parity=par,
                high_risk_status=hr_status,
                high_risk_notes=hr_notes if hr_status else None,
                antenatal_visits_count=anc_cnt,
                postnatal_visits_count=pnc_cnt,
                iron_folic_acid_distributed=True,
                tetanus_toxoid_status="Complete" if anc_cnt >= 2 else "1st Dose Given",
                notes="Nutrition counseling provided; IFA tablets supplied for 100 days."
            )
            db.add(mr)

            # Td dose record
            db.add(VaccinationRecord(
                patient_id=p.id,
                vaccine_id=vaccine_map["TD"].id,
                dose_number=1,
                status="Completed",
                scheduled_date=lmp + timedelta(days=90),
                administration_date=lmp + timedelta(days=95),
                administered_by_worker_id=worker_user.id,
                batch_number="TD-2025-88",
                notes="Td-1 dose given during 1st trimester"
            ))

            # Maternal follow-up
            if hr_status:
                db.add(FollowUp(
                    patient_id=p.id,
                    module_type="Maternal",
                    assigned_worker_id=worker_user.id,
                    due_date=today + timedelta(days=5),
                    status="Pending",
                    priority="High",
                    purpose="ANC High-Risk Follow-up: BP and Haemoglobin re-evaluation",
                    notes="Verify compliance with iron supplementation and blood pressure."
                ))

        # 3. Elderly Patients (60+ yrs)
        elderly_data = [
            ("AS-PAT-30301", "Vitthal Tukaram Kadam", today - timedelta(days=365 * 68), "Male", "Wai Gaon", "Satara", "Hypertension, Osteoarthritis", "Independent", "Amlodipine 5mg OD (Authorized by Dr. Joshi, Wai PHC)", "Son Santosh Kadam: 9822199001", today - timedelta(days=20), today + timedelta(days=10)),
            ("AS-PAT-30302", "Parvati Shankar Shinde", today - timedelta(days=365 * 74), "Female", "Pachwad Village", "Satara", "Type 2 Diabetes Mellitus, Mild Cataract", "Assisted", "Metformin 500mg BD (PHC Pachwad Authorized)", "Daughter-in-law Rekha: 9822199002", today - timedelta(days=45), today - timedelta(days=5)),  # Missed
            ("AS-PAT-30303", "Anandrao Narayan Patil", today - timedelta(days=365 * 65), "Male", "Bhuinj Village", "Satara", "Hypertension", "Independent", "Telmisartan 40mg OD", "Wife Suman: 9822199003", today - timedelta(days=15), today + timedelta(days=15)),
            ("AS-PAT-30304", "Shantabai Bhimrao Gaikwad", today - timedelta(days=365 * 81), "Female", "Shirwal Khurd", "Satara", "Chronic Joint Pain, Hypertension", "Bedridden", "Amlodipine 2.5mg OD, Calcium with Vit D3", "Grandson Rahul: 9822199004", today - timedelta(days=10), today + timedelta(days=20)),
            ("AS-PAT-30305", "Maruti Dattatray Bhosale", today - timedelta(days=365 * 70), "Male", "Khed Shivapur", "Pune", "COPD (Chronic Bronchitis), Hypertension", "Assisted", "Salbutamol Inhaler PRN, Amlodipine 5mg", "Son Nitin: 9822199005", today - timedelta(days=30), today + timedelta(days=5)),
            ("AS-PAT-30306", "Rukminibai Baburao Chavan", today - timedelta(days=365 * 66), "Female", "Chiplun Rural", "Ratnagiri", "Type 2 Diabetes, Diabetic Neuropathy", "Independent", "Glimepiride 1mg OD, Pregabalin 75mg HS", "Husband Baburao: 9822199006", today - timedelta(days=60), today - timedelta(days=15)),  # Missed
        ]

        for pub_id, name, dob, sex, village, dist, conditions, mobility, meds, emergency, last_chk, next_chk in elderly_data:
            p = Patient(
                public_id=pub_id,
                full_name=name,
                date_of_birth=dob,
                sex=sex,
                village_locality=village,
                district=dist,
                state="Maharashtra",
                contact_number="+91 94230 " + str(pub_id[-5:]),
                emergency_contact_name=emergency.split(":")[0],
                emergency_contact_phone="+91 94230 " + str(pub_id[-5:]),
                emergency_contact_relation="Family Caregiver",
                assigned_worker_id=worker_user.id,
                notes=f"Senior citizen regular care. Emergency: {emergency}",
                is_active=True
            )
            db.add(p)
            db.flush()

            er = ElderlyRecord(
                patient_id=p.id,
                chronic_conditions=conditions,
                mobility_status=mobility,
                authorized_medications_summary=meds,
                emergency_support_plan=emergency,
                last_checkup_date=last_chk,
                next_checkup_date=next_chk
            )
            db.add(er)

            # Elderly follow-up
            fu_status = "Overdue" if next_chk < today else "Pending"
            db.add(FollowUp(
                patient_id=p.id,
                module_type="Elderly",
                assigned_worker_id=worker_user.id,
                due_date=next_chk,
                status=fu_status,
                priority="Medium",
                purpose="Routine Geriatric Check-up & Medication Supply Verification",
                notes=f"Review vitals and confirm adherence to {conditions} management."
            ))

        # 4. General Healthcare Patients (Young adults, adolescents, middle age)
        general_data = [
            ("AS-PAT-40401", "Tanaji Sakharam More", today - timedelta(days=365 * 38), "Male", "Wai Gaon", "Satara", "Fever and chills for 4 days, body ache", "Malaria", "Confirmed", "Follow-up Required"),
            ("AS-PAT-40402", "Sunita Dilip Jadhav", today - timedelta(days=365 * 34), "Female", "Pachwad Village", "Satara", "High fever, retro-orbital pain, skin rash", "Dengue", "Suspected", "Under Review"),
            ("AS-PAT-40403", "Pandurang Govind Shinde", today - timedelta(days=365 * 52), "Male", "Bhuinj Village", "Satara", "Chronic productive cough > 3 weeks, evening fever, weight loss", "Tuberculosis", "Confirmed", "Monitoring"),
            ("AS-PAT-40404", "Meena Kishor Kadam", today - timedelta(days=365 * 42), "Female", "Shirwal Khurd", "Satara", "Hypopigmented patch with loss of sensation on right forearm", "Leprosy", "Confirmed", "Monitoring"),
            ("AS-PAT-40405", "Prakash Ramchandra Jagtap", today - timedelta(days=365 * 49), "Male", "Khed Shivapur", "Pune", "Acute watery diarrhoea and dehydration", "Other", "Confirmed", "Closed"),
            ("AS-PAT-40406", "Suman Eknath Salunkhe", today - timedelta(days=365 * 19), "Female", "Baramati Gram", "Pune", "Routine general health screening and haemoglobin test", None, None, None),
            ("AS-PAT-40407", "Dnyaneshwar Mahadev Raut", today - timedelta(days=365 * 16), "Male", "Chiplun Rural", "Ratnagiri", "School health check-up, adolescent nutrition counseling", None, None, None),
        ]

        for pub_id, name, dob, sex, village, dist, symptoms, dis_cat, clin_stat, wf_stat in general_data:
            p = Patient(
                public_id=pub_id,
                full_name=name,
                date_of_birth=dob,
                sex=sex,
                village_locality=village,
                district=dist,
                state="Maharashtra",
                contact_number="+91 99700 " + str(pub_id[-5:]),
                emergency_contact_name=f"{name.split()[0]}'s family",
                emergency_contact_phone="+91 99700 " + str(pub_id[-5:]),
                emergency_contact_relation="Family",
                assigned_worker_id=worker_user.id,
                notes=f"General health consultations.",
                is_active=True
            )
            db.add(p)
            db.flush()

            # Record visit
            visit = HealthcareVisit(
                patient_id=p.id,
                module_type="General",
                visit_date=today - timedelta(days=7),
                worker_id=worker_user.id,
                symptoms=symptoms,
                observations="Physical examination completed. Vitals logged in register.",
                vitals_summary="BP: 124/82 mmHg, Pulse: 78 bpm, Temp: 98.6 F",
                referral_facility="Wai Rural Hospital" if dis_cat in ["Malaria", "Dengue", "Tuberculosis"] else None,
                follow_up_date=today + timedelta(days=7) if dis_cat else None,
                notes="Patient advised on hydration and compliance."
            )
            db.add(visit)

            # Disease surveillance record if applicable
            if dis_cat:
                category = cat_map[dis_cat]
                dr = DiseaseRecord(
                    patient_id=p.id,
                    category_id=category.id,
                    clinical_status=clin_stat,
                    workflow_status=wf_stat,
                    reported_date=today - timedelta(days=7),
                    responsible_worker_id=worker_user.id,
                    symptoms_notes=symptoms,
                    referral_facility="Sub-District Hospital Wai" if clin_stat == "Confirmed" else "PHC Pachwad Lab",
                    follow_up_due_date=today + timedelta(days=category.default_follow_up_days),
                    resolution_notes="Patient responding well to prescribed regimen." if wf_stat == "Closed" else None
                )
                db.add(dr)

                # Coordinated follow-up
                db.add(FollowUp(
                    patient_id=p.id,
                    module_type="Disease",
                    related_record_id=dr.id,
                    assigned_worker_id=worker_user.id,
                    due_date=today + timedelta(days=category.default_follow_up_days),
                    status="Pending" if wf_stat != "Closed" else "Completed",
                    priority="High" if clin_stat == "Confirmed" else "Medium",
                    purpose=f"{dis_cat} Surveillance Follow-up: Verify symptom resolution and medication compliance.",
                    notes=f"Monitor clinical status: {clin_stat}. Check for danger signs."
                ))

        # Initial System Audit Trail
        print("[*] Recording seed audit logs...")
        db.add(AuditLog(
            user_id=admin_user.id,
            action="SYSTEM_INITIALIZED",
            entity_type="System",
            details="Demonstration seed data successfully populated with 25 patients across Maharashtra districts."
        ))

        db.commit()
        print("[OK] Development database successfully seeded with 25 fictional patients and linked records!")

    except Exception as e:
        db.rollback()
        print(f"[!] Seed failed with error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    seed_database(reset=reset_flag)
