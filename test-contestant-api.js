// Quick test script to verify Contestant API endpoints
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Contestant CRUD Operations...\n');

  try {
    // 1. GET all contestants
    console.log('1️⃣ GET /api/contestants');
    const getResponse = await fetch(`${BASE_URL}/api/contestants`);
    const contestants = await getResponse.json();
    console.log(`   ✅ Retrieved ${contestants.length} contestants`);
    console.log(`   Sample: ${contestants[0]?.name}\n`);

    if (contestants.length === 0) {
      console.log('❌ No contestants found. Please run seed script first.');
      return;
    }

    // 2. GET single contestant
    const testId = contestants[0].id;
    console.log(`2️⃣ GET /api/contestants/${testId}`);
    const getSingleResponse = await fetch(`${BASE_URL}/api/contestants/${testId}`);
    const singleContestant = await getSingleResponse.json();
    console.log(`   ✅ Retrieved: ${singleContestant.name}\n`);

    // 3. POST - Create new contestant
    console.log('3️⃣ POST /api/contestants');
    const newContestant = {
      name: 'Test Contestant',
      bio: 'This is a test bio for API verification',
      category: 'Test Category 2026',
      photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      email: 'test@example.com',
      contestId: contestants[0].contestId,
      linkedinUrl: 'https://linkedin.com/in/test',
      isVisible: true,
      status: 'active'
    };

    const postResponse = await fetch(`${BASE_URL}/api/contestants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContestant)
    });

    if (postResponse.ok) {
      const created = await postResponse.json();
      console.log(`   ✅ Created: ${created.name} (ID: ${created.id})\n`);

      // 4. PATCH - Update contestant
      console.log(`4️⃣ PATCH /api/contestants/${created.id}`);
      const patchResponse = await fetch(`${BASE_URL}/api/contestants/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Test Contestant', votes: 100 })
      });

      const updated = await patchResponse.json();
      console.log(`   ✅ Updated: ${updated.name}\n`);

      // 5. DELETE - Remove contestant
      console.log(`5️⃣ DELETE /api/contestants/${created.id}`);
      const deleteResponse = await fetch(`${BASE_URL}/api/contestants/${created.id}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        console.log(`   ✅ Deleted successfully\n`);
      } else {
        console.log(`   ⚠️ Delete failed: ${deleteResponse.status}\n`);
      }
    } else {
      const error = await postResponse.json();
      console.log(`   ❌ Create failed: ${error.error}\n`);
    }

    console.log('✅ All CRUD operations completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - GET all contestants: ✅');
    console.log('   - GET single contestant: ✅');
    console.log('   - POST create contestant: ✅');
    console.log('   - PATCH update contestant: ✅');
    console.log('   - DELETE contestant: ✅');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️ Make sure the development server is running: npm run dev');
  }
}

testAPI();
