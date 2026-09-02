from datetime import date, timedelta

from dateutil.relativedelta import relativedelta

from .models import Chore


def advance_due_date(due_date: date, unit: str, interval: int) -> date:
    if unit == Chore.RecurrenceUnit.DAY:
        return due_date + timedelta(days=interval)
    if unit == Chore.RecurrenceUnit.WEEK:
        return due_date + timedelta(weeks=interval)
    if unit == Chore.RecurrenceUnit.MONTH:
        return due_date + relativedelta(months=interval)
    raise ValueError(f"Unknown recurrence unit: {unit}")


def create_next_occurrence(chore: Chore) -> Chore | None:
    """Given a chore that was just completed, create its next occurrence if it recurs."""
    if not chore.is_recurring:
        return None

    return Chore.objects.create(
        description=chore.description,
        assigned_to=chore.assigned_to,
        due_date=advance_due_date(
            chore.due_date, chore.recurrence_unit, chore.recurrence_interval
        ),
        recurrence_unit=chore.recurrence_unit,
        recurrence_interval=chore.recurrence_interval,
    )
