from django.urls import path
from . import views

urlpatterns = [
    path('stats/',         views.DashboardStatsView.as_view(),   name='dashboard-stats'),
    path('activity/',      views.RecentActivityView.as_view(),   name='recent-activity'),
    path('trends/',        views.PatientTrendsView.as_view(),    name='patient-trends'),
    path('diseases/',      views.DiseaseTrendsView.as_view(),    name='disease-trends'),
    path('notifications/', views.NotificationsView.as_view(),    name='notifications'),
]