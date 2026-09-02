from datetime import date

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Chore, Person
from .services import advance_due_date


class AdvanceDueDateTests(TestCase):
    def test_day_interval(self):
        self.assertEqual(
            advance_due_date(date(2026, 1, 1), Chore.RecurrenceUnit.DAY, 4),
            date(2026, 1, 5),
        )

    def test_week_interval(self):
        self.assertEqual(
            advance_due_date(date(2026, 1, 1), Chore.RecurrenceUnit.WEEK, 1),
            date(2026, 1, 8),
        )

    def test_month_interval(self):
        self.assertEqual(
            advance_due_date(date(2026, 1, 15), Chore.RecurrenceUnit.MONTH, 2),
            date(2026, 3, 15),
        )

    def test_month_end_clamps(self):
        self.assertEqual(
            advance_due_date(date(2026, 1, 31), Chore.RecurrenceUnit.MONTH, 1),
            date(2026, 2, 28),
        )


class ChoreCompletionAPITests(APITestCase):
    def setUp(self):
        self.alice = Person.objects.create(name="Alice")
        self.bob = Person.objects.create(name="Bob")

    def _complete(self, chore, completed_by):
        url = reverse("chore-detail", args=[chore.id])
        return self.client.patch(
            url, {"is_completed": True, "completed_by": completed_by.id}, format="json"
        )

    def test_completing_non_recurring_chore_does_not_create_next_occurrence(self):
        chore = Chore.objects.create(
            description="Wash dishes", assigned_to=self.alice, due_date=date(2026, 1, 1)
        )
        response = self._complete(chore, self.bob)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        chore.refresh_from_db()
        self.assertTrue(chore.is_completed)
        self.assertEqual(chore.completed_by, self.bob)
        self.assertIsNotNone(chore.completed_at)
        self.assertEqual(Chore.objects.count(), 1)

    def test_completing_daily_chore_creates_next_occurrence(self):
        chore = Chore.objects.create(
            description="Feed the cat",
            assigned_to=self.alice,
            due_date=date(2026, 1, 1),
            recurrence_unit=Chore.RecurrenceUnit.DAY,
            recurrence_interval=1,
        )
        self._complete(chore, self.alice)

        self.assertEqual(Chore.objects.count(), 2)
        next_chore = Chore.objects.exclude(id=chore.id).get()
        self.assertEqual(next_chore.due_date, date(2026, 1, 2))
        self.assertFalse(next_chore.is_completed)
        self.assertEqual(next_chore.assigned_to, self.alice)
        self.assertEqual(next_chore.recurrence_unit, Chore.RecurrenceUnit.DAY)

    def test_completing_custom_interval_chore_creates_next_occurrence(self):
        chore = Chore.objects.create(
            description="Change air filter",
            assigned_to=self.alice,
            due_date=date(2026, 1, 1),
            recurrence_unit=Chore.RecurrenceUnit.MONTH,
            recurrence_interval=2,
        )
        self._complete(chore, self.alice)

        next_chore = Chore.objects.exclude(id=chore.id).get()
        self.assertEqual(next_chore.due_date, date(2026, 3, 1))
        self.assertEqual(next_chore.recurrence_interval, 2)

    def test_uncompleting_a_chore_clears_completion_fields_without_recurrence(self):
        chore = Chore.objects.create(
            description="Vacuum",
            assigned_to=self.alice,
            due_date=date(2026, 1, 1),
            recurrence_unit=Chore.RecurrenceUnit.WEEK,
        )
        self._complete(chore, self.alice)
        self.assertEqual(Chore.objects.count(), 2)

        url = reverse("chore-detail", args=[chore.id])
        response = self.client.patch(url, {"is_completed": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        chore.refresh_from_db()
        self.assertFalse(chore.is_completed)
        self.assertIsNone(chore.completed_at)
        self.assertIsNone(chore.completed_by)
        # Un-completing does not remove the already-generated next occurrence.
        self.assertEqual(Chore.objects.count(), 2)


class ArchiveQueryTests(APITestCase):
    def setUp(self):
        self.alice = Person.objects.create(name="Alice")

    def test_archive_filter_returns_only_completed_chores(self):
        Chore.objects.create(
            description="Done chore",
            assigned_to=self.alice,
            due_date=date(2026, 1, 1),
            is_completed=True,
        )
        Chore.objects.create(
            description="Pending chore", assigned_to=self.alice, due_date=date(2026, 1, 2)
        )

        response = self.client.get(reverse("chore-list"), {"is_completed": "true"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["description"], "Done chore")
