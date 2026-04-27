from django.core.management.base import BaseCommand
from seeds.seed import run_seed


class Command(BaseCommand):
    help = 'Seed the database with sample data for Playto'

    def handle(self, *args, **options):
        run_seed()
        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))
