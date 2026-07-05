from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.utils import timezone


def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
        'services': {
            'database': 'connected',
            'api': 'running',
        }
    })


urlpatterns = [
    path('admin/',              admin.site.urls),
    path('api/health/',         health_check,                    name='health-check'),
    path('api/auth/',           include('accounts.urls')),
    path('api/doctors/',        include('doctors.urls')),
    path('api/patients/',       include('patients.urls')),
    path('api/emr/',            include('emr.urls')),
    path('api/predictions/',    include('predictions.urls')),
    path('api/reports/',        include('reports.urls')),
    path('api/rag/',            include('rag.urls')),
    path('api/discharge/',      include('discharge_summary.urls')),
    path('api/dashboard/',      include('dashboard.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)