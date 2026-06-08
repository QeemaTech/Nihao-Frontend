import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function postStudentFinancialCheckout(body) {
  const res = await client.post(endpoints.student.financialsCheckout, body);
  return res?.data?.data ?? res?.data;
}

/** À la carte cohort purchase (pending payment; enrollment after admin marks PAID). */
export async function postStudentCohortDirectCheckout(cohortId, body) {
  const res = await client.post(endpoints.student.financialsCheckoutCohort(cohortId), body);
  return res?.data?.data ?? res?.data;
}

export async function validateStudentCoupon(body) {
  const res = await client.post(endpoints.student.couponValidate, body);
  return res?.data?.data ?? res?.data;
}
