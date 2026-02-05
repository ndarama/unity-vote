// Simple test script to verify API endpoints
// Run with: npx tsx scripts/test-api.ts

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Unity Vote API\n');

  try {
    // Test 1: List Contests
    console.log('1️⃣  Testing GET /api/contests');
    const contestsRes = await fetch(`${BASE_URL}/api/contests`);
    const contests = await contestsRes.json();
    console.log(`   ✅ Found ${contests.length} contest(s)\n`);

    if (contests.length > 0) {
      const contestId = contests[0].id;
      
      // Test 2: Get Single Contest
      console.log(`2️⃣  Testing GET /api/contests/${contestId}`);
      const contestRes = await fetch(`${BASE_URL}/api/contests/${contestId}`);
      const contest = await contestRes.json();
      console.log(`   ✅ Contest: ${contest.title}`);
      console.log(`   📊 Contestants: ${contest.contestants?.length || 0}\n`);

      // Test 3: List Contestants
      console.log('3️⃣  Testing GET /api/contestants');
      const contestantsRes = await fetch(`${BASE_URL}/api/contestants?contestId=${contestId}`);
      const contestants = await contestantsRes.json();
      console.log(`   ✅ Found ${contestants.length} contestant(s)`);
      
      if (contestants.length > 0) {
        contestants.slice(0, 3).forEach((c: any) => {
          console.log(`      - ${c.name} (${c.votes} votes)`);
        });
      }
      console.log();

      // Test 4: Get Single Contestant
      if (contestants.length > 0) {
        const contestantId = contestants[0].id;
        console.log(`4️⃣  Testing GET /api/contestants/${contestantId}`);
        const contestantRes = await fetch(`${BASE_URL}/api/contestants/${contestantId}`);
        const contestant = await contestantRes.json();
        console.log(`   ✅ Contestant: ${contestant.name}`);
        console.log(`   📧 Email: ${contestant.email}`);
        console.log(`   🎯 Category: ${contestant.category}\n`);

        // Test 5: Update Contestant
        console.log(`5️⃣  Testing PATCH /api/contestants/${contestantId}`);
        const updateRes = await fetch(`${BASE_URL}/api/contestants/${contestantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bio: `Updated bio - ${new Date().toISOString()}` })
        });
        const updated = await updateRes.json();
        console.log(`   ✅ Updated contestant bio\n`);

        // Test 6: Cast Vote
        console.log('6️⃣  Testing POST /api/votes');
        const voteRes = await fetch(`${BASE_URL}/api/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            contestantId: contestantId,
            contestId: contestId,
            ipAddress: '127.0.0.1'
          })
        });
        const voteData = await voteRes.json();
        
        if (voteRes.ok) {
          console.log(`   ✅ Vote cast successfully`);
          console.log(`   🎫 Vote ID: ${voteData.voteId}\n`);

          // Test 7: Verify Vote
          console.log(`7️⃣  Testing PATCH /api/votes/${voteData.voteId}/verify`);
          const verifyRes = await fetch(`${BASE_URL}/api/votes/${voteData.voteId}/verify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: '123456' })
          });
          const verifyData = await verifyRes.json();
          
          if (verifyRes.ok) {
            console.log(`   ✅ Vote verified successfully\n`);
          } else {
            console.log(`   ⚠️  ${verifyData.error}\n`);
          }
        } else {
          console.log(`   ⚠️  ${voteData.error}\n`);
        }
      }
    }

    console.log('✨ All tests completed!\n');
    console.log('📖 See API_DOCUMENTATION.md for full API reference');

  } catch (error) {
    console.error('❌ Error testing API:', error);
    console.log('\n⚠️  Make sure the development server is running:');
    console.log('   npm run dev\n');
  }
}

testAPI();
