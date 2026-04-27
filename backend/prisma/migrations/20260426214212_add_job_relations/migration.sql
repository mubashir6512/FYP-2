-- AddForeignKey
ALTER TABLE "painter_jobs" ADD CONSTRAINT "painter_jobs_painter_id_fkey" FOREIGN KEY ("painter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "painter_jobs" ADD CONSTRAINT "painter_jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
