<?php

namespace Tests\Repositories;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Repositories\ProductRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected ProductRepository $productRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->productRepository = app(ProductRepository::class);
    }

    public function test_get_last_sale_price()
    {
        // 1. Mock an existing sale
        $customer1 = Customer::factory()->create();
        $product1 = Product::factory()->create();

        $sale1 = Sale::factory()->create([
            'customer_id' => $customer1->id,
            'date' => now()->subDays(2),
        ]);
        SaleItem::factory()->create([
            'sale_id' => $sale1->id,
            'product_id' => $product1->id,
            'product_price' => 10.99,
        ]);

        // 2. Mock another sale for the same customer and product with a different price (more recent)
        $sale2 = Sale::factory()->create([
            'customer_id' => $customer1->id,
            'date' => now()->subDay(), // More recent
        ]);
        SaleItem::factory()->create([
            'sale_id' => $sale2->id,
            'product_id' => $product1->id,
            'product_price' => 12.99, // New price
        ]);

        // 3. Call productRepository->getLastSalePrice
        $lastPrice = $this->productRepository->getLastSalePrice($product1->id, $customer1->id);

        // 4. Assert that the returned price matches the product_price from the *most recent* SaleItem
        $this->assertEquals(12.99, $lastPrice);

        // 5. Test case: No previous sale
        $product2 = Product::factory()->create();
        $customer2 = Customer::factory()->create();
        $noSalePrice = $this->productRepository->getLastSalePrice($product2->id, $customer2->id);
        $this->assertNull($noSalePrice);

        // 6. Test case: Sale for different customer
        $customer3 = Customer::factory()->create();
        // Sale for product1 but for customer3
        $saleForCustomer3 = Sale::factory()->create([
            'customer_id' => $customer3->id,
            'date' => now(),
        ]);
        SaleItem::factory()->create([
            'sale_id' => $saleForCustomer3->id,
            'product_id' => $product1->id,
            'product_price' => 15.99,
        ]);
        // Try to get price for product1 and *customer1*. Should still be 12.99 or null if no other sales existed.
        // Since we have sale2 for customer1, it should return 12.99
        $priceForCustomer1 = $this->productRepository->getLastSalePrice($product1->id, $customer1->id);
        $this->assertEquals(12.99, $priceForCustomer1);
        // Try to get price for product1 and customer *without* direct sales (customer2)
        $priceForCustomer2WithProduct1 = $this->productRepository->getLastSalePrice($product1->id, $customer2->id);
        $this->assertNull($priceForCustomer2WithProduct1);


        // 7. Test case: Sale for different product
        $product3 = Product::factory()->create();
        // Sale for customer1 but for product3
        $saleForProduct3 = Sale::factory()->create([
            'customer_id' => $customer1->id,
            'date' => now(),
        ]);
        SaleItem::factory()->create([
            'sale_id' => $saleForProduct3->id,
            'product_id' => $product3->id,
            'product_price' => 18.99,
        ]);
        // Try to get price for *product1* and customer1. Should still be 12.99.
        $priceForProduct1Again = $this->productRepository->getLastSalePrice($product1->id, $customer1->id);
        $this->assertEquals(12.99, $priceForProduct1Again);
         // Try to get price for a product without sales for customer1 (product2)
        $priceForProduct2WithCustomer1 = $this->productRepository->getLastSalePrice($product2->id, $customer1->id);
        $this->assertNull($priceForProduct2WithCustomer1);
    }
}
