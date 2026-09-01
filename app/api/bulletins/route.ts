import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function generateRandomId(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function toMd5Lowercase(input: string) {
  return crypto.createHash("md5").update(input).digest("hex").toLowerCase();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    // Conversion du fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Chemin dans Supabase Storage
    const randomId = toMd5Lowercase( generateRandomId() );
    const storagePath = `uploads/${randomId}.pdf`;
    // const storagePath = `bulletins/${Date.now()}-${file.name}`;

    // Upload dans Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("bulletins")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      );
    }

    // Insertion dans la table bulletins
    const { data: insertData, error: insertError } = await supabase
      .from("bulletins")
      .insert({
        filename: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bulletin: insertData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
