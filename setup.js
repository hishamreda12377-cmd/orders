const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://zqqpknqexsnskowhiwfj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    // Test query to see if products table exists
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error && error.code === '42P01') {
        console.log("Table 'products' does not exist yet.");
        console.log("Please run the SQL in create_products_table.sql in Supabase SQL Editor first.");
        return;
    }
    
    if (error) {
        console.log("Error querying products:", error.message);
        return;
    }
    
    console.log("Products table exists! Current count:", data.length);
    
    // Fetch products from the live site
    const fetch = await import('node-fetch');
    const res = await fetch.default('https://sharkawey.netlify.app');
    const html = await res.text();
    
    // Parse HTML (simple regex approach)
    const products = [];
    const cardRegex = /<article class="a1">([\s\S]*?)<\/article>/g;
    let match;
    
    while ((match = cardRegex.exec(html)) !== null) {
        const cardHtml = match[1];
        
        const nameMatch = cardHtml.match(/<p>([^<]*)<\/p>/);
        const name = nameMatch ? nameMatch[1].trim() : '';
        
        const imgMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
        const img = imgMatch ? imgMatch[1] : '';
        
        const priceMatch = cardHtml.match(/addToCart\('[^']*',\s*(\d+)\)/);
        const price = priceMatch ? parseInt(priceMatch[1]) : 0;
        
        if (name && price > 0) {
            // Find category from parent section-box
            const sectionMatch = html.substring(0, match.index).match(/<div class="section-box"[^>]*data-category="([^"]*)"[^>]*>[\s\S]*$/);
            const category = sectionMatch ? sectionMatch[1] : '';
            
            products.push({
                name,
                price,
                images: img,
                pack: 'العلبة 24 قطعة',
                description: '',
                category
            });
        }
    }
    
    console.log(`Found ${products.length} products to import`);
    
    // Insert in batches
    const batchSize = 20;
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const { error: insertError } = await supabase.from('products').insert(batch);
        if (insertError) {
            console.log(`Error inserting batch ${i}:`, insertError.message);
        } else {
            console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} products)`);
        }
    }
    
    console.log('Done!');
}

main().catch(console.error);
