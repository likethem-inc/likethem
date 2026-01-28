#!/usr/bin/env ts-node
/**
 * Script to verify Supabase Storage configuration
 * 
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/verify-storage.ts
 */

import { config } from 'dotenv';
config();

// Check if we can import the functions
async function verifyStorage() {
  console.log('🔍 Verificando configuración de Supabase Storage...\n');

  // Check environment variables
  console.log('📋 Verificando variables de entorno:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está configurada');
    process.exit(1);
  } else {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  }

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
    process.exit(1);
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY: ***' + serviceRoleKey.slice(-4));
  }

  console.log('\n📦 Verificando bucket "products":');

  try {
    // Dynamic import to avoid build-time issues
    const { checkBucketExists } = await import('../lib/storage');
    
    const bucketExists = await checkBucketExists();
    
    if (!bucketExists) {
      console.error('❌ El bucket "products" no existe en Supabase Storage');
      console.error('\n📖 Por favor, sigue las instrucciones en docs/SUPABASE_STORAGE_SETUP.md');
      process.exit(1);
    } else {
      console.log('✅ El bucket "products" existe y está accesible');
    }

    console.log('\n🎉 ¡Configuración correcta! Todo está listo para usar Supabase Storage.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar el bucket:', error);
    console.error('\n💡 Asegúrate de que:');
    console.error('   1. Las credenciales de Supabase son correctas');
    console.error('   2. El bucket "products" existe en tu proyecto de Supabase');
    console.error('   3. Las políticas RLS están configuradas correctamente');
    console.error('\n📖 Consulta docs/SUPABASE_STORAGE_SETUP.md para más información');
    process.exit(1);
  }
}

verifyStorage();
