import { startProductOrderWorker } from "../modules/commerce/worker";

startProductOrderWorker();
console.log("[CommerceWorker] Started. Waiting for jobs...");
