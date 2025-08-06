// プロファイル機能のテスト
const UserProfileManager = require('./core/user-profile');
const MoonFortuneEngine = require('./core/moon-fortune');

async function testProfileFlow() {
  const profileManager = new UserProfileManager();
  const moonEngine = new MoonFortuneEngine();
  const testUserId = 'test_user_123';
  
  console.log('🧪 プロファイル機能テスト開始\n');
  
  try {
    // 1. 初期状態を確認
    console.log('1️⃣ 初期状態チェック');
    let status = await profileManager.getInputStatus(testUserId);
    console.log('  現在のステップ:', status.currentStep);
    console.log('');
    
    // 2. 名前を保存
    console.log('2️⃣ 名前を保存');
    await profileManager.saveProfile(testUserId, {
      userName: 'テスト太郎'
    });
    status = await profileManager.getInputStatus(testUserId);
    console.log('  現在のステップ:', status.currentStep);
    console.log('');
    
    // 3. 生年月日をパースして保存
    console.log('3️⃣ 生年月日を保存');
    const birthDateText = '1998年4月30日';
    const parsedDate = profileManager.parseBirthDate(birthDateText);
    console.log('  入力:', birthDateText);
    console.log('  パース結果:', parsedDate);
    await profileManager.saveProfile(testUserId, {
      birthDate: parsedDate
    });
    status = await profileManager.getInputStatus(testUserId);
    console.log('  現在のステップ:', status.currentStep);
    console.log('');
    
    // 4. 性別を保存
    console.log('4️⃣ 性別を保存');
    const genderText = '男性';
    const parsedGender = profileManager.parseGender(genderText);
    console.log('  入力:', genderText);
    console.log('  パース結果:', parsedGender);
    await profileManager.saveProfile(testUserId, {
      gender: parsedGender
    });
    status = await profileManager.getInputStatus(testUserId);
    console.log('  現在のステップ:', status.currentStep);
    console.log('');
    
    // 5. 相手の生年月日を保存
    console.log('5️⃣ 相手の生年月日を保存');
    const partnerBirthText = '1995/8/15';
    const parsedPartnerDate = profileManager.parseBirthDate(partnerBirthText);
    console.log('  入力:', partnerBirthText);
    console.log('  パース結果:', parsedPartnerDate);
    await profileManager.saveProfile(testUserId, {
      partnerBirthDate: parsedPartnerDate
    });
    status = await profileManager.getInputStatus(testUserId);
    console.log('  現在のステップ:', status.currentStep);
    console.log('');
    
    // 6. 相手の性別を保存
    console.log('6️⃣ 相手の性別を保存');
    const partnerGenderText = '女';
    const parsedPartnerGender = profileManager.parseGender(partnerGenderText);
    console.log('  入力:', partnerGenderText);
    console.log('  パース結果:', parsedPartnerGender);
    await profileManager.saveProfile(testUserId, {
      partnerGender: parsedPartnerGender
    });
    status = await profileManager.getInputStatus(testUserId);
    console.log('  現在のステップ:', status.currentStep);
    console.log('');
    
    // 7. 完成したプロファイルを確認
    console.log('7️⃣ 完成したプロファイル');
    const profile = await profileManager.getProfile(testUserId);
    console.log('  名前:', profile.userName);
    console.log('  生年月日:', profile.birthDate);
    console.log('  性別:', profile.gender);
    console.log('  相手の生年月日:', profile.partnerBirthDate);
    console.log('  相手の性別:', profile.partnerGender);
    console.log('');
    
    // 8. 月相占いを実行
    console.log('8️⃣ 月相占い実行');
    const moonReport = moonEngine.generateFreeReport(
      {
        birthDate: profile.birthDate,
        birthTime: '08:10',
        gender: profile.gender
      },
      {
        birthDate: profile.partnerBirthDate,
        birthTime: '12:00',
        gender: profile.partnerGender
      }
    );
    
    console.log('あなたの月相タイプ:', moonReport.user.moonPhaseType.name);
    console.log('  ', moonReport.user.moonPhaseType.description);
    console.log('');
    console.log('お相手の月相タイプ:', moonReport.partner.moonPhaseType.name);
    console.log('  ', moonReport.partner.moonPhaseType.description);
    console.log('');
    console.log('相性度:', moonReport.compatibility.score + '%');
    console.log('相性レベル:', moonReport.compatibility.level);
    console.log('');
    
    // 9. クリーンアップ
    console.log('9️⃣ プロファイル削除');
    await profileManager.deleteProfile(testUserId);
    const hasProfile = await profileManager.hasProfile(testUserId);
    console.log('  削除後のプロファイル存在確認:', hasProfile);
    
    console.log('\n✅ テスト完了！');
    
  } catch (error) {
    console.error('❌ エラー発生:', error);
  }
}

// テスト実行
testProfileFlow();