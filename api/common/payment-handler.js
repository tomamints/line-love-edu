/**
 * 共通決済ハンドラー
 * 決済プロバイダーに依存しない共通処理を管理
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase初期化
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// 日本標準時（JST）のISO文字列を取得する関数
function getJSTDateTime() {
    const now = new Date();
    const jstOffset = 9 * 60; // 9時間 = 540分
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    
    const year = jstTime.getUTCFullYear();
    const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstTime.getUTCDate()).padStart(2, '0');
    const hours = String(jstTime.getUTCHours()).padStart(2, '0');
    const minutes = String(jstTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(jstTime.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(jstTime.getUTCMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+09:00`;
}

// ランダムID生成
function generateRandomId(length = 9) {
    return Math.random().toString(36).substr(2, length);
}

class PaymentHandler {
    constructor() {
        this.supabase = supabase;
    }

    /**
     * 購入レコードを作成（決済開始時）
     * @param {Object} params
     * @param {string} params.diagnosisId - 診断ID
     * @param {string} params.userId - ユーザーID
     * @param {number} params.amount - 金額
     * @param {string} params.paymentMethod - 決済方法 (paypay, square, stripe等)
     * @param {Object} params.metadata - 決済プロバイダー固有の情報
     * @returns {Promise<{success: boolean, purchaseId?: string, error?: string}>}
     */
    async createPurchaseRecord({
        diagnosisId,
        userId,
        amount,
        paymentMethod,
        metadata = {}
    }) {
        if (!this.supabase) {
            return { success: false, error: 'Database not configured' };
        }

        try {
            const purchaseId = `pur_${Date.now()}_${generateRandomId()}`;
            
            // 診断データを取得して商品情報を取得
            const { data: diagnosis } = await this.supabase
                .from('diagnoses')
                .select('*, diagnosis_types(*)')
                .eq('id', diagnosisId)
                .single();

            const productName = diagnosis?.diagnosis_types?.name || 'おつきさま診断';
            const productId = diagnosis?.diagnosis_types?.id || 'otsukisama';

            const { error } = await this.supabase
                .from('purchases')
                .insert({
                    purchase_id: purchaseId,
                    user_id: userId || diagnosis?.user_id || 'anonymous',
                    diagnosis_id: diagnosisId,
                    product_type: 'diagnosis',
                    product_id: productId,
                    product_name: productName,
                    amount: amount,
                    currency: 'JPY',
                    payment_method: paymentMethod,
                    status: 'pending',
                    created_at: getJSTDateTime(),
                    metadata: metadata
                });

            if (error) {
                console.error('Failed to create purchase record:', error);
                return { success: false, error: error.message };
            }

            return { success: true, purchaseId };
        } catch (error) {
            console.error('Error creating purchase record:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 購入レコードを完了状態に更新
     * @param {Object} params
     * @param {string} params.purchaseId - 購入ID（任意）
     * @param {string} params.merchantPaymentId - 決済プロバイダーの支払いID（任意）
     * @param {Object} params.transactionData - トランザクション詳細
     * @returns {Promise<{success: boolean, purchase?: Object, error?: string}>}
     */
    async completePurchase({
        purchaseId,
        merchantPaymentId,
        transactionData = {}
    }) {
        if (!this.supabase) {
            return { success: false, error: 'Database not configured' };
        }

        try {
            let query = this.supabase
                .from('purchases')
                .update({
                    status: 'completed',
                    completed_at: getJSTDateTime(),
                    metadata: transactionData
                });

            // purchaseIdまたはmerchantPaymentIdで検索
            if (purchaseId) {
                query = query.eq('purchase_id', purchaseId);
            } else if (merchantPaymentId) {
                query = query.contains('metadata', { 
                    paypay_merchant_payment_id: merchantPaymentId 
                });
            } else {
                return { success: false, error: 'No identifier provided' };
            }

            const { data: purchase, error } = await query.select().single();

            if (error) {
                console.error('Failed to complete purchase:', error);
                return { success: false, error: error.message };
            }

            return { success: true, purchase };
        } catch (error) {
            console.error('Error completing purchase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * アクセス権限をプレビューからフルに更新
     * @param {Object} params
     * @param {string} params.diagnosisId - 診断ID
     * @param {string} params.userId - ユーザーID
     * @param {string} params.purchaseId - 購入ID
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async grantFullAccess({
        diagnosisId,
        userId,
        purchaseId
    }) {
        if (!this.supabase) {
            return { success: false, error: 'Database not configured' };
        }

        try {
            // まず既存のpreviewレコードを更新
            const { error: updateError } = await this.supabase
                .from('access_rights')
                .update({
                    access_level: 'full',
                    purchase_id: purchaseId,
                    valid_from: getJSTDateTime()
                })
                .eq('resource_id', diagnosisId)
                .eq('user_id', userId);

            if (updateError) {
                // 更新に失敗した場合は新規作成を試みる
                console.log('Updating access rights failed, trying to insert:', updateError);
                const { error: insertError } = await this.supabase
                    .from('access_rights')
                    .insert({
                        user_id: userId,
                        resource_type: 'diagnosis',
                        resource_id: diagnosisId,
                        access_level: 'full',
                        purchase_id: purchaseId,
                        valid_from: getJSTDateTime(),
                        valid_until: null // 永久アクセス
                    });
                
                if (insertError) {
                    console.error('Failed to grant access rights:', insertError);
                    return { success: false, error: insertError.message };
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Error granting full access:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 既存の購入レコードを確認
     * @param {string} diagnosisId - 診断ID
     * @param {string} userId - ユーザーID
     * @returns {Promise<{exists: boolean, purchase?: Object}>}
     */
    async checkExistingPurchase(diagnosisId, userId) {
        if (!this.supabase) {
            return { exists: false };
        }

        try {
            const { data: purchase } = await this.supabase
                .from('purchases')
                .select('*')
                .eq('diagnosis_id', diagnosisId)
                .eq('user_id', userId)
                .eq('status', 'completed')
                .single();

            return {
                exists: !!purchase,
                purchase: purchase
            };
        } catch (error) {
            return { exists: false };
        }
    }

    /**
     * 決済プロバイダー固有のメタデータを検索キーで取得
     * @param {string} key - メタデータのキー
     * @param {string} value - 検索する値
     * @returns {Promise<{success: boolean, purchase?: Object, error?: string}>}
     */
    async findPurchaseByMetadata(key, value) {
        if (!this.supabase) {
            return { success: false, error: 'Database not configured' };
        }

        try {
            const searchObj = {};
            searchObj[key] = value;

            const { data: purchase, error } = await this.supabase
                .from('purchases')
                .select('*')
                .contains('metadata', searchObj)
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, purchase };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = PaymentHandler;