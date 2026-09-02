from django.contrib import admin

from .models import Chore, Person


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]


@admin.register(Chore)
class ChoreAdmin(admin.ModelAdmin):
    list_display = [
        "description",
        "assigned_to",
        "due_date",
        "is_completed",
        "completed_by",
        "recurrence_unit",
        "recurrence_interval",
    ]
    list_filter = ["is_completed", "recurrence_unit", "assigned_to"]
