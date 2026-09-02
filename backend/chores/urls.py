from rest_framework.routers import DefaultRouter

from .views import ChoreViewSet, PersonViewSet

router = DefaultRouter()
router.register("chores", ChoreViewSet, basename="chore")
router.register("people", PersonViewSet, basename="person")

urlpatterns = router.urls
