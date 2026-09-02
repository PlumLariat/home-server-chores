from rest_framework import viewsets

from .models import Chore, Person
from .serializers import ChoreSerializer, PersonSerializer


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer


class ChoreViewSet(viewsets.ModelViewSet):
    queryset = Chore.objects.select_related("assigned_to", "completed_by").all()
    serializer_class = ChoreSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        due_date_after = params.get("due_date_after")
        if due_date_after:
            queryset = queryset.filter(due_date__gte=due_date_after)

        due_date_before = params.get("due_date_before")
        if due_date_before:
            queryset = queryset.filter(due_date__lte=due_date_before)

        is_completed = params.get("is_completed")
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == "true")

        assigned_to = params.get("assigned_to")
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        return queryset
