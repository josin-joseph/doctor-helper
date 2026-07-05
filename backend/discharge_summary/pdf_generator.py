from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import date


def generate_discharge_pdf(summary, doctor_profile=None):
    """Generate a professional discharge summary PDF."""
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Custom Styles ─────────────────────────────────────────────────
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a365d'),
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4a5568'),
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.white,
        backColor=colors.HexColor('#2b6cb0'),
        spaceBefore=12,
        spaceAfter=6,
        leftIndent=6,
        rightIndent=6,
        borderPadding=(4, 4, 4, 4),
    )
    content_style = ParagraphStyle(
        'Content',
        parent=styles['Normal'],
        fontSize=9,
        spaceAfter=4,
        leading=14,
    )
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#2d3748'),
        fontName='Helvetica-Bold',
    )

    # ── Header ────────────────────────────────────────────────────────
    hospital_name = "DOCTOR HELPER HOSPITAL"
    if doctor_profile and doctor_profile.hospital_name:
        hospital_name = doctor_profile.hospital_name.upper()

    elements.append(Paragraph(hospital_name, title_style))
    elements.append(Paragraph("DISCHARGE SUMMARY", subtitle_style))

    if doctor_profile and doctor_profile.hospital_address:
        elements.append(Paragraph(doctor_profile.hospital_address, subtitle_style))

    elements.append(HRFlowable(
        width="100%", thickness=2,
        color=colors.HexColor('#2b6cb0'), spaceAfter=10
    ))

    # ── Patient Info Table ────────────────────────────────────────────
    elements.append(Paragraph("PATIENT INFORMATION", section_style))

    patient = summary.patient
    patient_data = [
        ['Patient Name:', patient.get_full_name(),
         'Patient ID:', patient.patient_id],
        ['Age / Gender:',
         f"{patient.get_age()} Years / {patient.gender.title()}",
         'Blood Group:', patient.blood_group or 'Not recorded'],
        ['Phone:', patient.phone,
         'Address:', patient.city or patient.address or 'Not provided'],
        ['Admission Date:', str(summary.admission_date),
         'Discharge Date:', str(summary.discharge_date)],
        ['Duration of Stay:', f"{summary.get_stay_duration()} Days",
         'Ward / Bed:', f"{summary.ward or '-'} / {summary.bed_number or '-'}"],
    ]

    patient_table = Table(patient_data, colWidths=[3.5*cm, 6*cm, 3.5*cm, 6*cm])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f7fafc')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1),
         [colors.white, colors.HexColor('#ebf8ff')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bee3f8')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.3*cm))

    # ── Diagnosis ─────────────────────────────────────────────────────
    elements.append(Paragraph("FINAL DIAGNOSIS", section_style))
    elements.append(Paragraph(summary.diagnosis or 'Not specified', content_style))
    if summary.differential_diagnosis:
        elements.append(Paragraph(
            f"<b>Differential Diagnosis:</b> {summary.differential_diagnosis}",
            content_style
        ))

    # ── Chief Complaints ──────────────────────────────────────────────
    elements.append(Paragraph("CHIEF COMPLAINTS", section_style))
    elements.append(Paragraph(summary.chief_complaints, content_style))

    # ── Hospital Course ───────────────────────────────────────────────
    elements.append(Paragraph("HOSPITAL COURSE", section_style))
    if summary.ai_narrative:
        elements.append(Paragraph(summary.ai_narrative, content_style))
    else:
        elements.append(Paragraph(summary.hospital_course, content_style))

    if summary.complications:
        elements.append(Paragraph(
            f"<b>Complications:</b> {summary.complications}", content_style
        ))

    # ── Investigations ────────────────────────────────────────────────
    if summary.investigations or summary.imaging_results:
        elements.append(Paragraph("INVESTIGATIONS", section_style))
        if summary.investigations:
            elements.append(Paragraph(
                f"<b>Lab Reports:</b> {summary.investigations}", content_style
            ))
        if summary.imaging_results:
            elements.append(Paragraph(
                f"<b>Imaging:</b> {summary.imaging_results}", content_style
            ))

    # ── Treatment ─────────────────────────────────────────────────────
    if summary.treatment_given or summary.procedures_performed:
        elements.append(Paragraph("TREATMENT & PROCEDURES", section_style))
        if summary.treatment_given:
            elements.append(Paragraph(
                f"<b>Treatment:</b> {summary.treatment_given}", content_style
            ))
        if summary.procedures_performed:
            elements.append(Paragraph(
                f"<b>Procedures:</b> {summary.procedures_performed}", content_style
            ))

    # ── Discharge Medications ─────────────────────────────────────────
    elements.append(Paragraph("DISCHARGE MEDICATIONS", section_style))
    elements.append(Paragraph(
        summary.discharge_medications or 'No medications prescribed',
        content_style
    ))

    # ── Condition at Discharge ────────────────────────────────────────
    elements.append(Paragraph("CONDITION AT DISCHARGE", section_style))
    elements.append(Paragraph(
        summary.condition_at_discharge.upper(), content_style
    ))

    # ── Follow-up & Instructions ──────────────────────────────────────
    elements.append(Paragraph("ADVICE & FOLLOW-UP", section_style))
    if summary.follow_up_date:
        elements.append(Paragraph(
            f"<b>Follow-up Date:</b> {summary.follow_up_date}", content_style
        ))
    if summary.follow_up_instructions:
        elements.append(Paragraph(
            f"<b>Follow-up Instructions:</b> {summary.follow_up_instructions}",
            content_style
        ))
    if summary.diet_instructions:
        elements.append(Paragraph(
            f"<b>Diet:</b> {summary.diet_instructions}", content_style
        ))
    if summary.activity_restrictions:
        elements.append(Paragraph(
            f"<b>Activity:</b> {summary.activity_restrictions}", content_style
        ))
    if summary.special_instructions:
        elements.append(Paragraph(
            f"<b>Special Instructions:</b> {summary.special_instructions}",
            content_style
        ))

    # ── Doctor Signature ──────────────────────────────────────────────
    elements.append(Spacer(1, 1*cm))
    elements.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor('#2b6cb0'), spaceAfter=6
    ))

    doctor = summary.doctor
    doctor_name = doctor.get_full_name() if doctor else 'N/A'
    specialization = ''
    qualification = ''
    license_no = ''

    if doctor_profile:
        specialization = doctor_profile.get_specialization_display()
        qualification = doctor_profile.qualification
        license_no = doctor_profile.license_number

    sig_data = [[
        Paragraph(f"<b>Dr. {doctor_name}</b><br/>"
                  f"{specialization}<br/>{qualification}<br/>"
                  f"License: {license_no}", content_style),
        Paragraph(
            f"<b>Date:</b> {date.today().strftime('%d-%m-%Y')}<br/><br/>"
            "<b>Signature: _________________</b>",
            ParagraphStyle('sig', parent=content_style, alignment=TA_RIGHT)
        ),
    ]]
    sig_table = Table(sig_data, colWidths=[9*cm, 9*cm])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(sig_table)

    # Footer note
    elements.append(Spacer(1, 0.5*cm))
    elements.append(Paragraph(
        "<i>This discharge summary was generated by Doctor Helper CDSS. "
        "Please follow up with your physician as instructed.</i>",
        ParagraphStyle('footer', parent=styles['Normal'],
                       fontSize=7, textColor=colors.grey, alignment=TA_CENTER)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer