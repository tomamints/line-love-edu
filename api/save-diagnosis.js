// 診断データを保存するAPI
const ProfilesDB = require('../core/database/profiles-db');

module.exports = async (req, res) => {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { userId, name, birthDate, patternId } = req.body;
        
        if (!userId || !name || !birthDate || patternId === undefined) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['userId', 'name', 'birthDate', 'patternId']
            });
        }
        
        // ProfilesDBを使用してデータを保存
        const profilesDB = new ProfilesDB();
        
        // 診断データを保存
        const diagnosisData = {
            userName: name,
            birthDate: birthDate,
            moonPatternId: patternId,
            diagnosisDate: new Date().toISOString(),
            diagnosisType: 'otsukisama'
        };
        
        await profilesDB.saveProfile(userId, diagnosisData);
        
        // 診断IDを生成（実際のDBではUUIDを使用）
        const diagnosisId = `diag_${userId}_${Date.now()}`;
        
        res.status(200).json({
            success: true,
            diagnosisId: diagnosisId,
            message: '診断データを保存しました'
        });
        
    } catch (error) {
        console.error('診断データ保存エラー:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};