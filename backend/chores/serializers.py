from django.utils import timezone
from rest_framework import serializers

from .models import Chore, Person
from .services import create_next_occurrence


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name", "created_at"]


class ChoreSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.name", read_only=True)
    completed_by_name = serializers.CharField(
        source="completed_by.name", read_only=True, default=None
    )

    class Meta:
        model = Chore
        fields = [
            "id",
            "description",
            "assigned_to",
            "assigned_to_name",
            "due_date",
            "recurrence_unit",
            "recurrence_interval",
            "is_completed",
            "completed_at",
            "completed_by",
            "completed_by_name",
            "created_at",
        ]
        read_only_fields = ["completed_at", "created_at"]

    def validate_recurrence_interval(self, value):
        if value < 1:
            raise serializers.ValidationError("Recurrence interval must be at least 1.")
        return value

    def update(self, instance, validated_data):
        was_completed = instance.is_completed
        will_be_completed = validated_data.get("is_completed", was_completed)

        if not was_completed and will_be_completed:
            validated_data["completed_at"] = timezone.now()
        elif was_completed and not will_be_completed:
            validated_data["completed_at"] = None
            validated_data["completed_by"] = None

        instance = super().update(instance, validated_data)

        if not was_completed and will_be_completed:
            create_next_occurrence(instance)

        return instance
