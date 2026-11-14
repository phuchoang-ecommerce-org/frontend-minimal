-- Use only with a disposable local development database.
INSERT INTO marketplace.account(id, normalized_login, password_hash, role, status, display_name)
VALUES ('88888888-8888-8888-8888-888888888888', 'synthetic.seller-b@example.test', 'unusable-test-hash', 'SELLER', 'ACTIVE', 'Synthetic Seller B') ON CONFLICT DO NOTHING;
INSERT INTO marketplace.seller_shop(id, account_id, name, status)
VALUES ('99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'Synthetic Seller B', 'ACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO marketplace.product(id, seller_id, category_id, title, description, published)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'Synthetic Second Seller Item', 'Second seller browse fixture', true) ON CONFLICT DO NOTHING;
INSERT INTO marketplace.variant(id, product_id, sku, label, price_usd)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SYNTHETIC-SECOND-ITEM', 'Standard', 9.75) ON CONFLICT DO NOTHING;
INSERT INTO marketplace.stock(variant_id, on_hand)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5) ON CONFLICT DO NOTHING;
