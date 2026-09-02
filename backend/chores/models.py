from django.db import models


class Person(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Chore(models.Model):
    class RecurrenceUnit(models.TextChoices):
        DAY = "day", "Day"
        WEEK = "week", "Week"
        MONTH = "month", "Month"

    description = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(
        Person, on_delete=models.CASCADE, related_name="assigned_chores"
    )
    due_date = models.DateField()

    recurrence_unit = models.CharField(
        max_length=10, choices=RecurrenceUnit.choices, null=True, blank=True
    )
    recurrence_interval = models.PositiveSmallIntegerField(default=1)

    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="completed_chores",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_date", "id"]

    def __str__(self):
        return f"{self.description} ({self.due_date})"

    @property
    def is_recurring(self):
        return self.recurrence_unit is not None
