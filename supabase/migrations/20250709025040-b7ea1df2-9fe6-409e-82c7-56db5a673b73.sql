-- Add new enum values first (must be in separate transaction)
ALTER TYPE email_template_type ADD VALUE 'intro-package';
ALTER TYPE trigger_type ADD VALUE 'intro-package-purchased';
ALTER TYPE trigger_type ADD VALUE 'first-class-attended';