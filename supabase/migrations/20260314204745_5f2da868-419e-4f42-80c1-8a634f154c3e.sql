SELECT cron.schedule(
  'send-monthly-reports',
  '0 9 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://adzkzmhqokkkhanwnrxc.supabase.co/functions/v1/send-monthly-reports',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);