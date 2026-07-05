from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta, date

from patients.models import Patient
from emr.models import Encounter, VitalSigns
from predictions.models import DiseasePrediction
from reports.models import LabReport
from discharge_summary.models import DischargeSummary
from rag.models import MedicalQuery


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user
        today = date.today()
        last_30_days = today - timedelta(days=30)
        last_7_days  = today - timedelta(days=7)

        # ── Patients ──────────────────────────────────────────────────
        patients = Patient.objects.filter(doctor=doctor)
        total_patients     = patients.count()
        active_patients    = patients.filter(status='active').count()
        critical_patients  = patients.filter(status='critical').count()
        new_this_month     = patients.filter(
            created_at__date__gte=last_30_days
        ).count()

        # ── Encounters ────────────────────────────────────────────────
        encounters = Encounter.objects.filter(doctor=doctor)
        total_encounters       = encounters.count()
        encounters_this_week   = encounters.filter(
            encounter_date__date__gte=last_7_days
        ).count()
        encounters_this_month  = encounters.filter(
            encounter_date__date__gte=last_30_days
        ).count()

        # ── Predictions ───────────────────────────────────────────────
        predictions = DiseasePrediction.objects.filter(doctor=doctor)
        total_predictions      = predictions.count()
        predictions_this_month = predictions.filter(
            created_at__date__gte=last_30_days
        ).count()

        # ── Lab Reports ───────────────────────────────────────────────
        lab_reports = LabReport.objects.filter(doctor=doctor)
        total_lab_reports = lab_reports.count()
        abnormal_reports  = sum(
            1 for r in lab_reports
            if r.parameters.exclude(status='normal').exists()
        )
        critical_reports = sum(
            1 for r in lab_reports
            if r.parameters.filter(
                status__in=['critical_low', 'critical_high']
            ).exists()
        )

        # ── Discharge Summaries ───────────────────────────────────────
        discharge_summaries = DischargeSummary.objects.filter(doctor=doctor)
        total_discharges = discharge_summaries.count()

        # ── AI Queries ────────────────────────────────────────────────
        ai_queries = MedicalQuery.objects.filter(doctor=doctor)
        total_ai_queries = ai_queries.count()

        return Response({
            'patients': {
                'total':          total_patients,
                'active':         active_patients,
                'critical':       critical_patients,
                'new_this_month': new_this_month,
            },
            'encounters': {
                'total':        total_encounters,
                'this_week':    encounters_this_week,
                'this_month':   encounters_this_month,
            },
            'predictions': {
                'total':       total_predictions,
                'this_month':  predictions_this_month,
            },
            'lab_reports': {
                'total':    total_lab_reports,
                'abnormal': abnormal_reports,
                'critical': critical_reports,
            },
            'discharges': {
                'total': total_discharges,
            },
            'ai_queries': {
                'total': total_ai_queries,
            },
        })


class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user
        limit = int(request.query_params.get('limit', 10))

        # Recent patients
        recent_patients = Patient.objects.filter(
            doctor=doctor
        ).order_by('-created_at')[:5]

        # Recent encounters
        recent_encounters = Encounter.objects.filter(
            doctor=doctor
        ).order_by('-encounter_date')[:5]

        # Recent predictions
        recent_predictions = DiseasePrediction.objects.filter(
            doctor=doctor
        ).order_by('-created_at')[:5]

        # Recent lab reports
        recent_lab_reports = LabReport.objects.filter(
            doctor=doctor
        ).order_by('-created_at')[:5]

        return Response({
            'recent_patients': [
                {
                    'id':         p.id,
                    'name':       p.get_full_name(),
                    'patient_id': p.patient_id,
                    'status':     p.status,
                    'created_at': p.created_at,
                }
                for p in recent_patients
            ],
            'recent_encounters': [
                {
                    'id':             e.id,
                    'patient_name':   e.patient.get_full_name(),
                    'diagnosis':      e.diagnosis[:80],
                    'encounter_type': e.encounter_type,
                    'encounter_date': e.encounter_date,
                }
                for e in recent_encounters
            ],
            'recent_predictions': [
                {
                    'id':               p.id,
                    'patient_name':     p.patient.get_full_name(),
                    'predicted_disease':p.predicted_disease,
                    'confidence_score': p.confidence_score,
                    'created_at':       p.created_at,
                }
                for p in recent_predictions
            ],
            'recent_lab_reports': [
                {
                    'id':          r.id,
                    'patient_name':r.patient.get_full_name(),
                    'report_type': r.report_type,
                    'report_date': r.report_date,
                    'status':      r.status,
                }
                for r in recent_lab_reports
            ],
        })


class PatientTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user
        # Last 6 months patient registrations
        months_data = []
        today = date.today()

        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i*30))
            month_end   = (month_start + timedelta(days=31)).replace(day=1)
            count = Patient.objects.filter(
                doctor=doctor,
                created_at__date__gte=month_start,
                created_at__date__lt=month_end,
            ).count()
            months_data.append({
                'month': month_start.strftime('%b %Y'),
                'count': count,
            })

        return Response({'monthly_registrations': months_data})


class DiseaseTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user
        predictions = DiseasePrediction.objects.filter(doctor=doctor)

        # Top 10 predicted diseases
        disease_counts = {}
        for p in predictions:
            disease_counts[p.predicted_disease] = \
                disease_counts.get(p.predicted_disease, 0) + 1

        top_diseases = sorted(
            disease_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        # Patient demographics
        patients = Patient.objects.filter(doctor=doctor)
        gender_dist = {
            'male':   patients.filter(gender='male').count(),
            'female': patients.filter(gender='female').count(),
            'other':  patients.filter(gender='other').count(),
        }

        # Status distribution
        status_dist = {
            'active':     patients.filter(status='active').count(),
            'discharged': patients.filter(status='discharged').count(),
            'critical':   patients.filter(status='critical').count(),
        }

        # Age groups
        all_patients = list(patients)
        age_groups = {'0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0}
        for p in all_patients:
            age = p.get_age()
            if age <= 18:
                age_groups['0-18'] += 1
            elif age <= 35:
                age_groups['19-35'] += 1
            elif age <= 50:
                age_groups['36-50'] += 1
            elif age <= 65:
                age_groups['51-65'] += 1
            else:
                age_groups['65+'] += 1

        return Response({
            'top_diseases':       [{'disease': d, 'count': c} for d, c in top_diseases],
            'gender_distribution': gender_dist,
            'status_distribution': status_dist,
            'age_groups':          age_groups,
        })


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor = request.user
        today  = date.today()
        notifications = []

        # Critical lab reports
        critical_labs = LabReport.objects.filter(
            doctor=doctor,
            parameters__status__in=['critical_low', 'critical_high']
        ).distinct().order_by('-created_at')[:5]

        for lab in critical_labs:
            notifications.append({
                'type':    'critical_lab',
                'message': f"Critical lab values for {lab.patient.get_full_name()}",
                'patient': lab.patient.get_full_name(),
                'date':    str(lab.report_date),
                'priority':'high',
            })

        # Follow-up reminders (due today or overdue)
        due_followups = Encounter.objects.filter(
            doctor=doctor,
            follow_up_date__lte=today,
            follow_up_date__isnull=False,
        ).order_by('follow_up_date')[:5]

        for enc in due_followups:
            overdue = (today - enc.follow_up_date).days
            notifications.append({
                'type':    'follow_up',
                'message': f"Follow-up {'overdue' if overdue > 0 else 'due today'} "
                           f"for {enc.patient.get_full_name()}",
                'patient': enc.patient.get_full_name(),
                'date':    str(enc.follow_up_date),
                'priority':'medium' if overdue <= 0 else 'high',
            })

        # Critical patients
        critical_patients = Patient.objects.filter(
            doctor=doctor, status='critical'
        )
        for p in critical_patients:
            notifications.append({
                'type':    'critical_patient',
                'message': f"{p.get_full_name()} is marked as critical",
                'patient': p.get_full_name(),
                'date':    str(today),
                'priority':'high',
            })

        # Sort by priority
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        notifications.sort(key=lambda x: priority_order.get(x['priority'], 2))

        return Response({
            'notifications': notifications,
            'unread_count':  len(notifications),
        })