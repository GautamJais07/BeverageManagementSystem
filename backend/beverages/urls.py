from rest_framework.routers import DefaultRouter
from .views import BeverageViewSet
router = DefaultRouter()
router.register("beverages", BeverageViewSet, basename="beverage")
urlpatterns = router.urls
