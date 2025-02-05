--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    email text,
    phone text,
    address text,
    tax_number text,
    notes text,
    total_orders integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    last_order_date timestamp without time zone,
    rating numeric
);


ALTER TABLE public.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.deliveries (
    id integer NOT NULL,
    supplier_id integer NOT NULL,
    expected_date timestamp without time zone NOT NULL,
    status text NOT NULL,
    notes text,
    items jsonb NOT NULL
);


ALTER TABLE public.deliveries OWNER TO neondb_owner;

--
-- Name: deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.deliveries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deliveries_id_seq OWNER TO neondb_owner;

--
-- Name: deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.deliveries_id_seq OWNED BY public.deliveries.id;


--
-- Name: delivery_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.delivery_items (
    id integer NOT NULL,
    delivery_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric NOT NULL
);


ALTER TABLE public.delivery_items OWNER TO neondb_owner;

--
-- Name: delivery_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.delivery_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_items_id_seq OWNER TO neondb_owner;

--
-- Name: delivery_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.delivery_items_id_seq OWNED BY public.delivery_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    contact_id integer NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text NOT NULL,
    total numeric NOT NULL,
    items jsonb NOT NULL,
    invoice_number text,
    notes text
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO neondb_owner;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    description text,
    price numeric NOT NULL,
    stock_level integer DEFAULT 0 NOT NULL,
    min_stock_level integer DEFAULT 0,
    unit text DEFAULT 'db'::text
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: deliveries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries ALTER COLUMN id SET DEFAULT nextval('public.deliveries_id_seq'::regclass);


--
-- Name: delivery_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_items ALTER COLUMN id SET DEFAULT nextval('public.delivery_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contacts (id, name, type, email, phone, address, tax_number, notes, total_orders, total_spent, last_order_date, rating) FROM stdin;
1	Tech Solutions Kft.	customer	info@techsolutions.hu	+36 1 234 5678	1052 Budapest, Váci utca 15.	12345678-2-41	Kiemelt partner, IT szolgáltatások	12	4500000	2024-01-15 00:00:00	\N
2	Green Energy Zrt.	customer	contact@greenenergy.hu	+36 1 987 6543	1134 Budapest, Lehel út 25.	87654321-2-41	Megújuló energia szektor	8	2800000	2024-01-20 00:00:00	\N
3	Smart Manufacturing Kft.	customer	info@smartmanufacturing.hu	+36 1 555 1234	1095 Budapest, Soroksári út 30-34.	98765432-2-41	Ipari automatizálás	15	6700000	2024-01-25 00:00:00	\N
4	TechComponents Kft.	supplier	info@techcomponents.hu	+36 1 234 5678	1052 Budapest, Váci utca 10.	12345678-2-41	Megbízható alkatrész beszállító	0	0	\N	4.8
5	Office Solutions Bt.	supplier	sales@officesolutions.hu	+36 1 987 6543	1134 Budapest, Lehel út 15.	87654321-1-41	Irodai kellékek és bútorok	0	0	\N	4.5
6	Global IT Services	supplier	contact@globalit.hu	+36 1 555 1234	1061 Budapest, Andrássy út 20.	98765432-2-41	Szoftver licenszek és szolgáltatások	0	0	\N	4.9
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.deliveries (id, supplier_id, expected_date, status, notes, items) FROM stdin;
1	4	2024-02-10 00:00:00	pending	Standard delivery	[{"price": "499999", "quantity": 3, "productId": 1}]
2	5	2024-02-15 00:00:00	in_transit	Express delivery	[{"price": "89999", "quantity": 5, "productId": 2}]
3	6	2024-02-20 00:00:00	received	Bulk order	[{"price": "12999", "quantity": 10, "productId": 3}]
\.


--
-- Data for Name: delivery_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.delivery_items (id, delivery_id, product_id, quantity, price) FROM stdin;
1	1	25	5	699000.00
2	1	26	3	459000.00
3	2	2	10	129990.00
4	2	17	10	129990.00
5	2	30	10	159000.00
6	3	8	20	29990.00
7	3	32	20	45000.00
8	3	7	15	49990.00
9	3	21	15	39990.00
10	3	33	15	89900.00
11	5	25	10	699000.00
12	5	26	5	459000.00
13	6	8	20	29990.00
14	6	32	20	45000.00
15	6	35	15	899000.00
16	7	2	30	129990.00
17	7	17	30	129990.00
18	7	30	30	159000.00
19	8	25	8	699000.00
20	8	26	12	459000.00
21	9	8	25	29990.00
22	9	32	25	45000.00
23	9	7	10	49990.00
24	9	21	10	39990.00
25	9	33	10	89900.00
26	11	25	15	699000.00
27	11	2	10	129990.00
28	11	17	10	129990.00
29	11	30	10	159000.00
30	12	8	20	29990.00
31	12	32	20	45000.00
32	1	1	5	150000
33	1	2	3	200000
34	2	3	10	45000
35	3	4	20	25000
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, contact_id, order_date, status, total, items, invoice_number, notes) FROM stdin;
1	2	2025-02-05 18:56:08.544663	completed	10	[]	23233	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, sku, description, price, stock_level, min_stock_level, unit) FROM stdin;
1	Gaming Laptop	LAP-001	High-performance gaming laptop	499999	5	2	db
2	Office Chair	CHR-001	Ergonomic office chair	89999	10	3	db
3	Wireless Mouse	MOU-001	Bluetooth wireless mouse	12999	20	5	db
4	asdad	ssd	\N	1	1	1	db
5	vcx	sss	\N	1	1	1	db
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
CAa8KufCtf_X5TvKznJooG8_Ru9LRRtw	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-02-05 22:53:12
7hLHb0AcE2F4zOT18kNKqBudmFAoR6Kq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-02-06 10:21:01
qsovj9wpFoW7Ez9JQER4r1t1e97nO-Rp	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-02-06 20:02:13
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password) FROM stdin;
1	admin	f7b759068b91e1463d7ea8c6c8d16cee0d809cd8b53cdabf3e31a3c9b795b962da9b43729a27df47d6755053d1e595777956a9a13aa5e8bacec73c4e0b0da963.9876d27fc984f0b2a588d5df2857fd8c
\.


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 6, true);


--
-- Name: deliveries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.deliveries_id_seq', 3, true);


--
-- Name: delivery_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.delivery_items_id_seq', 35, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: delivery_items delivery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.delivery_items
    ADD CONSTRAINT delivery_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: deliveries deliveries_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.contacts(id);


--
-- Name: orders orders_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

