-- Create email notification trigger function
CREATE OR REPLACE FUNCTION send_order_notification_email()
RETURNS TRIGGER AS $$
DECLARE
  email_type TEXT;
BEGIN
  -- Determine email type based on the change
  IF TG_OP = 'INSERT' THEN
    email_type := 'order_confirmation';
  ELSIF TG_OP = 'UPDATE' AND OLD.payment_status != NEW.payment_status AND NEW.payment_status = 'paid' THEN
    email_type := 'payment_confirmation';
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    email_type := 'status_update';
  ELSE
    RETURN NEW;
  END IF;

  -- Call the edge function to send email
  PERFORM net.http_post(
    url := 'https://lcsevtixfmcikjhnjobf.supabase.co/functions/v1/send-order-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjc2V2dGl4Zm1jaWtqaG5qb2JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ4NjI1OSwiZXhwIjoyMDY5MDYyMjU5fQ.5a7Z0lJmP2wkm1KQSRVGGnBgU5yZh0_7LyqZKWdT6gM'
    ),
    body := jsonb_build_object(
      'type', email_type,
      'order_id', NEW.id::text,
      'customer_email', NEW.customer_email,
      'customer_name', NEW.customer_name,
      'new_status', CASE WHEN email_type = 'status_update' THEN NEW.status ELSE NULL END
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order changes
DROP TRIGGER IF EXISTS order_email_notification_trigger ON orders;
CREATE TRIGGER order_email_notification_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_notification_email();