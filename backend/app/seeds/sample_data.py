from datetime import date, timedelta

# Default Development Staff Users
SAMPLE_USERS = [
    {
        "email": "admin@aarogyaseva.org",
        "password": "Admin@Aarogya2026",
        "full_name": "Dr. Ramesh Kulkarni",
        "role": "administrator",
        "locality": "District Health Office, Satara",
        "phone": "+91 98220 11223"
    },
    {
        "email": "worker@aarogyaseva.org",
        "password": "Worker@Aarogya2026",
        "full_name": "Sunita Patil (ASHA / ANM)",
        "role": "worker",
        "locality": "Primary Health Centre, Wai",
        "phone": "+91 98500 44556"
    },
    {
        "email": "supervisor@aarogyaseva.org",
        "password": "Supervisor@Aarogya2026",
        "full_name": "Dr. Pradeep Deshmukh",
        "role": "supervisor",
        "locality": "Sub-District Health Supervisory Unit, Karad",
        "phone": "+91 94220 77889"
    }
]

# Standard Immunization Catalogue
SAMPLE_VACCINES = [
    {
        "code": "BCG",
        "name": "Bacillus Calmette-Guérin",
        "target_disease": "Tuberculosis",
        "standard_doses": 1,
        "recommended_age_days": 0,
        "description": "Administered at birth or as early as possible within 1 year of age."
    },
    {
        "code": "OPV-0",
        "name": "Oral Polio Vaccine (Birth Dose)",
        "target_disease": "Poliomyelitis",
        "standard_doses": 1,
        "recommended_age_days": 0,
        "description": "Birth dose given orally within first 15 days."
    },
    {
        "code": "HEP-B-0",
        "name": "Hepatitis B (Birth Dose)",
        "target_disease": "Hepatitis B Virus",
        "standard_doses": 1,
        "recommended_age_days": 0,
        "description": "Given within 24 hours of birth."
    },
    {
        "code": "PENTA-1",
        "name": "Pentavalent-1",
        "target_disease": "Diphtheria, Pertussis, Tetanus, Hep B, Hib",
        "standard_doses": 3,
        "recommended_age_days": 42,  # 6 weeks
        "description": "Combination vaccine administered at 6 weeks of age."
    },
    {
        "code": "ROTA-1",
        "name": "Rotavirus Vaccine Dose 1",
        "target_disease": "Rotavirus Diarrhoea",
        "standard_doses": 3,
        "recommended_age_days": 42,
        "description": "Oral rotavirus drops given at 6 weeks."
    },
    {
        "code": "PCV-1",
        "name": "Pneumococcal Conjugate Vaccine Dose 1",
        "target_disease": "Pneumococcal Disease / Pneumonia",
        "standard_doses": 2,
        "recommended_age_days": 42,
        "description": "First dose at 6 weeks."
    },
    {
        "code": "PENTA-2",
        "name": "Pentavalent-2",
        "target_disease": "Diphtheria, Pertussis, Tetanus, Hep B, Hib",
        "standard_doses": 3,
        "recommended_age_days": 70,  # 10 weeks
        "description": "Second dose given at 10 weeks."
    },
    {
        "code": "PENTA-3",
        "name": "Pentavalent-3",
        "target_disease": "Diphtheria, Pertussis, Tetanus, Hep B, Hib",
        "standard_doses": 3,
        "recommended_age_days": 98,  # 14 weeks
        "description": "Third dose given at 14 weeks."
    },
    {
        "code": "MR-1",
        "name": "Measles-Rubella Dose 1",
        "target_disease": "Measles and Rubella",
        "standard_doses": 2,
        "recommended_age_days": 270,  # 9 months
        "description": "First dose given between 9 to 12 months."
    },
    {
        "code": "JE-1",
        "name": "Japanese Encephalitis Dose 1",
        "target_disease": "Japanese Encephalitis",
        "standard_doses": 2,
        "recommended_age_days": 270,
        "description": "Given at 9-12 months in endemic districts."
    },
    {
        "code": "DPT-B1",
        "name": "DPT Booster-1",
        "target_disease": "Diphtheria, Pertussis, Tetanus",
        "standard_doses": 2,
        "recommended_age_days": 480,  # 16-24 months
        "description": "First booster given between 16 and 24 months."
    },
    {
        "code": "TD",
        "name": "Tetanus and Adult Diphtheria (Td)",
        "target_disease": "Tetanus and Diphtheria",
        "standard_doses": 2,
        "recommended_age_days": 3650,  # 10 years
        "description": "Administered at 10 and 16 years, and for pregnant women."
    }
]

# Disease Surveillance Categories
SAMPLE_DISEASE_CATEGORIES = [
    {
        "name": "Malaria",
        "description": "Vector-borne parasitic infection transmitted by Anopheles mosquitoes.",
        "default_follow_up_days": 5
    },
    {
        "name": "Dengue",
        "description": "Arboviral fever transmitted by Aedes aegypti mosquitoes with monitoring for thrombocytopenia.",
        "default_follow_up_days": 3
    },
    {
        "name": "Tuberculosis",
        "description": "Chronic mycobacterial respiratory infection requiring long-term DOTS protocol adherence.",
        "default_follow_up_days": 14
    },
    {
        "name": "Leprosy",
        "description": "Chronic granulomatous infection caused by Mycobacterium leprae; requires MDT compliance.",
        "default_follow_up_days": 30
    },
    {
        "name": "Other",
        "description": "Acute diarrhoeal disease, viral hepatitis, or acute respiratory infections.",
        "default_follow_up_days": 7
    }
]

