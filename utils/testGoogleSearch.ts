import { googleCustomSearch } from './googleCustomSearch';

async function testGoogleSearch() {
  try {
    console.log('Testing Google Custom Search API...');
    
    // Test basic search
    const results = await googleCustomSearch.search('kompyuter narxlar', { num: 3 });
    console.log('Search results:', results);
    
    // Test supplier search
    const suppliers = await googleCustomSearch.findSuppliers('kompyuter');
    console.log('Supplier results:', suppliers);
    
    // Test company info search
    const companyInfo = await googleCustomSearch.getCompanyInfo('Apple Inc');
    console.log('Company info:', companyInfo);
    
    // Test tender search
    const tenders = await googleCustomSearch.findTenders('kompyuter', 'O\'zbekiston');
    console.log('Tender results:', tenders);
    
    console.log('Google Custom Search tests completed successfully!');
  } catch (error) {
    console.error('Google Custom Search test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGoogleSearch();
}

export default testGoogleSearch;