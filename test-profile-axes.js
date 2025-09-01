const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const testUserId = 'U69bf66f589f5303a9615e94d7a7dc693';

async function checkAndSetProfileAxes() {
    console.log('Checking profile for user:', testUserId);
    
    // Check current profile
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', testUserId)
        .single();
    
    if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        
        // Create new profile if doesn't exist
        if (fetchError.code === 'PGRST116') {
            console.log('Profile not found, creating new one...');
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    user_id: testUserId,
                    emotional_expression: 'straight',
                    distance_style: 'moderate',
                    love_values: 'romantic',
                    love_energy: 'intense',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (createError) {
                console.error('Error creating profile:', createError);
                return;
            }
            
            console.log('Created new profile:', newProfile);
            return;
        }
        return;
    }
    
    console.log('Current profile:', profile);
    
    // Check if 4 axes data exists
    if (!profile.emotional_expression || !profile.distance_style || 
        !profile.love_values || !profile.love_energy) {
        
        console.log('Missing 4 axes data, updating...');
        
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                emotional_expression: profile.emotional_expression || 'straight',
                distance_style: profile.distance_style || 'moderate',
                love_values: profile.love_values || 'romantic',
                love_energy: profile.love_energy || 'intense',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', testUserId)
            .select()
            .single();
        
        if (updateError) {
            console.error('Error updating profile:', updateError);
            return;
        }
        
        console.log('Updated profile with 4 axes data:', updatedProfile);
    } else {
        console.log('Profile already has 4 axes data:');
        console.log('- emotional_expression:', profile.emotional_expression);
        console.log('- distance_style:', profile.distance_style);
        console.log('- love_values:', profile.love_values);
        console.log('- love_energy:', profile.love_energy);
    }
    
    // Also check recent diagnoses
    const { data: diagnoses, error: diagError } = await supabase
        .from('diagnoses')
        .select('id, created_at, result_data')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(3);
    
    if (!diagError && diagnoses) {
        console.log('\nRecent diagnoses for this user:');
        diagnoses.forEach(diag => {
            console.log(`- ${diag.id} (${diag.created_at})`);
            if (diag.result_data) {
                console.log('  4 axes in diagnosis:');
                console.log('  - emotional_expression:', diag.result_data.emotional_expression);
                console.log('  - distance_style:', diag.result_data.distance_style);
                console.log('  - love_values:', diag.result_data.love_values);
                console.log('  - love_energy:', diag.result_data.love_energy);
            }
        });
    }
}

checkAndSetProfileAxes();