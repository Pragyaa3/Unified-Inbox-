import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  twitterHandle: z.string().optional(),
  facebookId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data = UpdateContactSchema.parse(body);

    const updated = await prisma.contact.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contact.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Contact deleted" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
