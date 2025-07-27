const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupAIAnnotations() {
  try {
    console.log('🔍 Searching for AI-created annotations...');
    
    // Find all annotations created by the AI system
    const aiAnnotations = await prisma.annotation.findMany({
      where: {
        OR: [
          { validateur: 'Système IA' },
          { annotation: { contains: 'Analyse automatique IA' } },
          { id_sequence: { startsWith: 'AI_' } }
        ]
      },
      include: {
        rapportAnalyses: true,
        video: true
      }
    });

    console.log(`📊 Found ${aiAnnotations.length} AI-created annotations to clean up`);

    if (aiAnnotations.length === 0) {
      console.log('✅ No AI-created annotations found. Database is clean!');
      return;
    }

    // Display what will be deleted
    console.log('\n🗑️  Annotations to be deleted:');
    aiAnnotations.forEach((ann, index) => {
      console.log(`${index + 1}. ID: ${ann.id_sequence}`);
      console.log(`   Annotation: ${ann.annotation}`);
      console.log(`   Validateur: ${ann.validateur}`);
      console.log(`   Date: ${ann.date_annotation}`);
      console.log(`   Associated Rapports: ${ann.rapportAnalyses.length}`);
      console.log('');
    });

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('❓ Do you want to proceed with deletion? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('🗑️  Starting cleanup...');

        let deletedCount = 0;
        let rapportCount = 0;

        for (const annotation of aiAnnotations) {
          try {
            // Delete associated rapports first
            if (annotation.rapportAnalyses.length > 0) {
              await prisma.rapportAnalyse.deleteMany({
                where: {
                  annotationId: annotation.id
                }
              });
              rapportCount += annotation.rapportAnalyses.length;
              console.log(`   Deleted ${annotation.rapportAnalyses.length} associated rapports`);
            }

            // Delete the annotation
            await prisma.annotation.delete({
              where: {
                id: annotation.id
              }
            });
            deletedCount++;
            console.log(`   ✅ Deleted annotation: ${annotation.id_sequence}`);

          } catch (error) {
            console.error(`   ❌ Error deleting annotation ${annotation.id_sequence}:`, error.message);
          }
        }

        console.log('\n🎉 Cleanup completed!');
        console.log(`📊 Deleted ${deletedCount} AI-created annotations`);
        console.log(`📊 Deleted ${rapportCount} associated rapports`);
        console.log('✅ Database is now clean!');

      } else {
        console.log('❌ Cleanup cancelled by user');
      }

      rl.close();
      await prisma.$disconnect();
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the cleanup
cleanupAIAnnotations(); 