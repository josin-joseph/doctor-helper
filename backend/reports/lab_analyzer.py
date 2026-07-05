# Normal reference ranges for common lab parameters
REFERENCE_RANGES = {
    # CBC
    'hemoglobin':         {'min': 12.0,  'max': 17.5,  'unit': 'g/dL',    'category': 'CBC'},
    'wbc':                {'min': 4.0,   'max': 11.0,  'unit': '10³/µL',  'category': 'CBC'},
    'platelets':          {'min': 150.0, 'max': 400.0, 'unit': '10³/µL',  'category': 'CBC'},
    'rbc':                {'min': 4.2,   'max': 5.9,   'unit': '10⁶/µL',  'category': 'CBC'},
    'hematocrit':         {'min': 36.0,  'max': 52.0,  'unit': '%',        'category': 'CBC'},
    'mcv':                {'min': 80.0,  'max': 100.0, 'unit': 'fL',       'category': 'CBC'},
    'mch':                {'min': 27.0,  'max': 33.0,  'unit': 'pg',       'category': 'CBC'},
    'mchc':               {'min': 31.0,  'max': 37.0,  'unit': 'g/dL',    'category': 'CBC'},

    # LFT
    'sgpt':               {'min': 7.0,   'max': 56.0,  'unit': 'U/L',     'category': 'LFT'},
    'sgot':               {'min': 10.0,  'max': 40.0,  'unit': 'U/L',     'category': 'LFT'},
    'total_bilirubin':    {'min': 0.2,   'max': 1.2,   'unit': 'mg/dL',   'category': 'LFT'},
    'direct_bilirubin':   {'min': 0.0,   'max': 0.3,   'unit': 'mg/dL',   'category': 'LFT'},
    'alkaline_phosphatase':{'min': 44.0, 'max': 147.0, 'unit': 'U/L',     'category': 'LFT'},
    'total_protein':      {'min': 6.0,   'max': 8.3,   'unit': 'g/dL',    'category': 'LFT'},
    'albumin':            {'min': 3.4,   'max': 5.4,   'unit': 'g/dL',    'category': 'LFT'},

    # KFT
    'creatinine':         {'min': 0.6,   'max': 1.2,   'unit': 'mg/dL',   'category': 'KFT'},
    'urea':               {'min': 7.0,   'max': 20.0,  'unit': 'mg/dL',   'category': 'KFT'},
    'uric_acid':          {'min': 3.5,   'max': 7.2,   'unit': 'mg/dL',   'category': 'KFT'},
    'egfr':               {'min': 60.0,  'max': 120.0, 'unit': 'mL/min',  'category': 'KFT'},

    # Lipid Profile
    'total_cholesterol':  {'min': 0.0,   'max': 200.0, 'unit': 'mg/dL',   'category': 'Lipid'},
    'ldl':                {'min': 0.0,   'max': 100.0, 'unit': 'mg/dL',   'category': 'Lipid'},
    'hdl':                {'min': 40.0,  'max': 60.0,  'unit': 'mg/dL',   'category': 'Lipid'},
    'triglycerides':      {'min': 0.0,   'max': 150.0, 'unit': 'mg/dL',   'category': 'Lipid'},

    # Glucose
    'fasting_glucose':    {'min': 70.0,  'max': 100.0, 'unit': 'mg/dL',   'category': 'Glucose'},
    'pp_glucose':         {'min': 70.0,  'max': 140.0, 'unit': 'mg/dL',   'category': 'Glucose'},
    'hba1c':              {'min': 4.0,   'max': 5.7,   'unit': '%',        'category': 'Glucose'},

    # Thyroid
    'tsh':                {'min': 0.4,   'max': 4.0,   'unit': 'mIU/L',   'category': 'Thyroid'},
    't3':                 {'min': 80.0,  'max': 200.0, 'unit': 'ng/dL',   'category': 'Thyroid'},
    't4':                 {'min': 5.1,   'max': 14.1,  'unit': 'µg/dL',   'category': 'Thyroid'},

    # Electrolytes
    'sodium':             {'min': 136.0, 'max': 145.0, 'unit': 'mEq/L',   'category': 'Electrolytes'},
    'potassium':          {'min': 3.5,   'max': 5.0,   'unit': 'mEq/L',   'category': 'Electrolytes'},
    'chloride':           {'min': 98.0,  'max': 107.0, 'unit': 'mEq/L',   'category': 'Electrolytes'},
    'calcium':            {'min': 8.5,   'max': 10.5,  'unit': 'mg/dL',   'category': 'Electrolytes'},

    # Cardiac
    'troponin_i':         {'min': 0.0,   'max': 0.04,  'unit': 'ng/mL',   'category': 'Cardiac'},
    'ck_mb':              {'min': 0.0,   'max': 25.0,  'unit': 'U/L',     'category': 'Cardiac'},
    'bnp':                {'min': 0.0,   'max': 100.0, 'unit': 'pg/mL',   'category': 'Cardiac'},
}

CLINICAL_SIGNIFICANCE = {
    'hemoglobin': {
        'low': 'Low hemoglobin suggests anemia. Further evaluation for iron deficiency, B12/folate deficiency, or chronic disease recommended.',
        'high': 'Elevated hemoglobin may indicate polycythemia vera, dehydration, or chronic hypoxia.',
        'critical_low': 'CRITICAL: Severely low hemoglobin. Immediate medical attention required.',
    },
    'wbc': {
        'low': 'Low WBC (leukopenia) may indicate viral infection, bone marrow suppression, or autoimmune disease.',
        'high': 'Elevated WBC (leukocytosis) suggests infection, inflammation, or leukemia. Clinical correlation required.',
        'critical_high': 'CRITICAL: Severely elevated WBC. Rule out leukemia or severe sepsis immediately.',
    },
    'platelets': {
        'low': 'Low platelets (thrombocytopenia) increases bleeding risk. Check for ITP, dengue, or medication effects.',
        'high': 'Elevated platelets (thrombocytosis) may indicate reactive process or essential thrombocythemia.',
        'critical_low': 'CRITICAL: Severe thrombocytopenia. High risk of spontaneous bleeding.',
    },
    'creatinine': {
        'high': 'Elevated creatinine suggests impaired kidney function. Monitor eGFR and urine output.',
        'critical_high': 'CRITICAL: Severely elevated creatinine indicates acute kidney injury or CKD stage 4-5.',
    },
    'fasting_glucose': {
        'low': 'Low fasting glucose (hypoglycemia). Assess for insulin excess, liver disease, or medication effect.',
        'high': 'Elevated fasting glucose suggests pre-diabetes or diabetes mellitus. HbA1c recommended.',
        'critical_high': 'CRITICAL: Severely elevated glucose. Risk of diabetic ketoacidosis.',
    },
    'total_cholesterol': {
        'high': 'Elevated cholesterol increases cardiovascular risk. Lifestyle modification and statin therapy may be indicated.',
        'critical_high': 'CRITICAL: Very high cholesterol. High risk of atherosclerosis and cardiovascular events.',
    },
    'tsh': {
        'low': 'Low TSH suggests hyperthyroidism. Check free T3/T4 and consider thyroid scan.',
        'high': 'Elevated TSH indicates hypothyroidism. Thyroid hormone replacement may be needed.',
    },
    'troponin_i': {
        'high': 'Elevated Troponin I indicates myocardial injury. Rule out acute myocardial infarction immediately.',
        'critical_high': 'CRITICAL: Markedly elevated Troponin. Acute MI likely. Immediate cardiac intervention required.',
    },
}


def get_clinical_significance(param_name, status):
    param_key = param_name.lower().replace(' ', '_')
    significance = CLINICAL_SIGNIFICANCE.get(param_key, {})
    return significance.get(status, f'Value is {status}. Clinical correlation recommended.')


def get_reference_range(param_name):
    param_key = param_name.lower().replace(' ', '_')
    return REFERENCE_RANGES.get(param_key)


def analyze_parameters(parameters: list):
    """
    parameters: list of dicts with keys:
      parameter_name, value, unit, normal_min (opt), normal_max (opt)
    """
    results = []
    abnormal_count = 0
    critical_count = 0

    for param in parameters:
        name = param['parameter_name']
        value = float(param['value'])
        unit = param.get('unit', '')

        # Get reference range
        ref = get_reference_range(name)
        normal_min = param.get('normal_min') or (ref['min'] if ref else None)
        normal_max = param.get('normal_max') or (ref['max'] if ref else None)

        # Determine status
        status = 'normal'
        if normal_min is not None and normal_max is not None:
            if value < normal_min * 0.8:
                status = 'critical_low'
                critical_count += 1
                abnormal_count += 1
            elif value < normal_min:
                status = 'low'
                abnormal_count += 1
            elif value > normal_max * 1.2:
                status = 'critical_high'
                critical_count += 1
                abnormal_count += 1
            elif value > normal_max:
                status = 'high'
                abnormal_count += 1

        significance = get_clinical_significance(name, status)

        results.append({
            'parameter_name': name,
            'value': value,
            'unit': unit,
            'normal_min': normal_min,
            'normal_max': normal_max,
            'status': status,
            'clinical_significance': significance,
        })

    return {
        'parameters': results,
        'summary': {
            'total': len(results),
            'normal': len(results) - abnormal_count,
            'abnormal': abnormal_count,
            'critical': critical_count,
        }
    }


def generate_summary(analysis_result: dict, report_type: str):
    summary_parts = []
    params = analysis_result['parameters']
    stats = analysis_result['summary']

    summary_parts.append(
        f"Lab Report Analysis — {report_type.upper()}\n"
        f"Total Parameters: {stats['total']} | "
        f"Normal: {stats['normal']} | "
        f"Abnormal: {stats['abnormal']} | "
        f"Critical: {stats['critical']}\n"
    )

    critical = [p for p in params if 'critical' in p['status']]
    abnormal = [p for p in params if p['status'] in ('low', 'high')]

    if critical:
        summary_parts.append("⚠️ CRITICAL VALUES:")
        for p in critical:
            summary_parts.append(
                f"  • {p['parameter_name']}: {p['value']} {p['unit']} "
                f"[{p['status'].upper()}] — {p['clinical_significance']}"
            )

    if abnormal:
        summary_parts.append("\n📊 ABNORMAL VALUES:")
        for p in abnormal:
            summary_parts.append(
                f"  • {p['parameter_name']}: {p['value']} {p['unit']} "
                f"[{p['status'].upper()}] — {p['clinical_significance']}"
            )

    if not critical and not abnormal:
        summary_parts.append("✅ All parameters within normal limits.")

    return '\n'.join(summary_parts)