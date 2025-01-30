import { NextResponse } from "next/server";
import { sriDocRecibido } from "@/app/server-functions/sriDocRecibido";
import db from "@/utils/db";

export async function POST(req) {
  await db();

  try {
    const { ruc, password, year, month, voucherType, date } = await req.json();
    const result = await sriDocRecibido({
      ruc: ruc,
      password: password,
      anio: year,
      mes: month,
      tipoComprobante: voucherType,
      dia: date,
    });

    console.log(result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
