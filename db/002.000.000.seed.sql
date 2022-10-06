--
-- TOC entry 263 (class 1259 OID 17156)
-- Name: app_queue_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_queue_inbox (
    id uuid NOT NULL,
    tenant uuid,
    queue character varying(50) NOT NULL,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    application_id character varying(100) NOT NULL,
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 264 (class 1259 OID 30439)
-- Name: app_queue_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_queue_outbox (
    id uuid NOT NULL,
    tenant uuid,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    published_at timestamp without time zone,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 266 (class 1259 OID 102418)
-- Name: app_rank_recalculation_task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_rank_recalculation_task (
    id uuid NOT NULL,
    successful_review_rankings integer,
    failed_review_rankings integer,
    review_rankings_to_calculate integer,
    successful_object_rankings integer,
    failed_object_rankings integer,
    object_rankings_to_calculate integer,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    requesting_user_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL,
    finished_at timestamp without time zone
);


--
-- TOC entry 265 (class 1259 OID 59465)
-- Name: app_version_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_version_info (
    key character varying(50) NOT NULL,
    version character varying(50) NOT NULL,
    released_at timestamp without time zone,
    deployed_at timestamp without time zone,
    description text
);


--
-- TOC entry 200 (class 1259 OID 16389)
-- Name: bp_blueprint_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_blueprint_template (
    id uuid NOT NULL,
    tenant uuid,
    file_ref character varying(50) NOT NULL,
    language character varying(20) NOT NULL,
    template_key uuid NOT NULL,
    name character varying(100) NOT NULL,
    extension character varying(10) NOT NULL,
    template_type smallint NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 201 (class 1259 OID 16392)
-- Name: bp_forget_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_forget_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 202 (class 1259 OID 16395)
-- Name: bp_queue_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_queue_inbox (
    id uuid NOT NULL,
    tenant uuid,
    queue character varying(50) NOT NULL,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    application_id character varying(100) NOT NULL,
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 203 (class 1259 OID 16401)
-- Name: bp_queue_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_queue_outbox (
    id uuid NOT NULL,
    tenant uuid,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    published_at timestamp without time zone,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 204 (class 1259 OID 16407)
-- Name: bp_storage_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_storage_file (
    id uuid NOT NULL,
    tenant uuid,
    file_ref character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    extension character varying(10) NOT NULL,
    mime_type character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    purge_at timestamp without time zone,
    purged_at timestamp without time zone
);


--
-- TOC entry 205 (class 1259 OID 16410)
-- Name: bp_tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_tenant (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 206 (class 1259 OID 16413)
-- Name: bp_tenant_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_tenant_configuration (
    id uuid NOT NULL,
    tenant uuid,
    type smallint NOT NULL,
    value text NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 207 (class 1259 OID 16419)
-- Name: bp_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_user (
    id uuid NOT NULL,
    tenant uuid,
    profile uuid NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 208 (class 1259 OID 16422)
-- Name: bp_user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_user_profile (
    id uuid NOT NULL,
    tenant uuid,
    timezone character varying(50) NOT NULL,
    culture character varying(20) NOT NULL,
    language character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 209 (class 1259 OID 16425)
-- Name: bp_version_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_version_info (
    key character varying(50) NOT NULL,
    version character varying(50) NOT NULL,
    released_at timestamp without time zone,
    deployed_at timestamp without time zone,
    description text
);


--
-- TOC entry 210 (class 1259 OID 16431)
-- Name: bp_what_you_know_about_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bp_what_you_know_about_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    storage_file uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 211 (class 1259 OID 16434)
-- Name: idp_credential_reset_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_credential_reset_token (
    token character varying(50) NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    provider smallint NOT NULL,
    is_consumed smallint NOT NULL,
    is_active smallint NOT NULL,
    data text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 212 (class 1259 OID 16440)
-- Name: idp_forget_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_forget_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 213 (class 1259 OID 16443)
-- Name: idp_persisted_grant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_persisted_grant (
    key character varying(200) NOT NULL,
    client_id character varying(200) NOT NULL,
    subject_id character varying(200),
    "user" uuid,
    type character varying(50) NOT NULL,
    data text NOT NULL,
    creation_time timestamp without time zone NOT NULL,
    expiration timestamp without time zone,
    session_id character varying(200),
    description character varying(200),
    consumed_time timestamp without time zone
);


--
-- TOC entry 214 (class 1259 OID 16449)
-- Name: idp_queue_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_queue_inbox (
    id uuid NOT NULL,
    tenant uuid,
    queue character varying(50) NOT NULL,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    application_id character varying(100) NOT NULL,
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 16455)
-- Name: idp_queue_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_queue_outbox (
    id uuid NOT NULL,
    tenant uuid,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    published_at timestamp without time zone,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 16461)
-- Name: idp_registration_invitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_registration_invitation (
    token character varying(50) NOT NULL,
    tenant uuid,
    "user" uuid,
    is_consumed smallint NOT NULL,
    is_active smallint NOT NULL,
    data text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    mobile_phone character varying(50),
    email character varying(250)
);


--
-- TOC entry 217 (class 1259 OID 16467)
-- Name: idp_storage_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_storage_file (
    id uuid NOT NULL,
    tenant uuid,
    file_ref character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    extension character varying(10) NOT NULL,
    mime_type character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    purge_at timestamp without time zone,
    purged_at timestamp without time zone
);


--
-- TOC entry 218 (class 1259 OID 16470)
-- Name: idp_tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_tenant (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16473)
-- Name: idp_tenant_credential_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_tenant_credential_provider (
    id integer NOT NULL,
    tenant uuid NOT NULL,
    provider smallint NOT NULL,
    data text,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16479)
-- Name: idp_tenant_credential_provider_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_tenant_credential_provider_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3433 (class 0 OID 0)
-- Dependencies: 220
-- Name: idp_tenant_credential_provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_tenant_credential_provider_id_seq OWNED BY public.idp_tenant_credential_provider.id;


--
-- TOC entry 221 (class 1259 OID 16481)
-- Name: idp_used_totp_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_used_totp_token (
    "user" uuid NOT NULL,
    totp integer NOT NULL,
    used_at timestamp without time zone NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 16484)
-- Name: idp_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_user (
    id uuid NOT NULL,
    tenant uuid,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying(250) NOT NULL,
    type smallint NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16487)
-- Name: idp_user_claim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_user_claim (
    id integer NOT NULL,
    "user" uuid NOT NULL,
    tenant uuid,
    claim character varying(50) NOT NULL,
    value character varying(250) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16490)
-- Name: idp_user_claim_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_user_claim_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 224
-- Name: idp_user_claim_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_user_claim_id_seq OWNED BY public.idp_user_claim.id;


--
-- TOC entry 225 (class 1259 OID 16492)
-- Name: idp_user_consent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_user_consent (
    "user" uuid NOT NULL,
    consent uuid NOT NULL,
    tenant uuid,
    response smallint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 16495)
-- Name: idp_user_consent_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_user_consent_history (
    id uuid NOT NULL,
    "user" uuid NOT NULL,
    tenant uuid,
    consent uuid NOT NULL,
    response smallint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16498)
-- Name: idp_user_credential; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_user_credential (
    "user" uuid NOT NULL,
    provider smallint NOT NULL,
    tenant uuid,
    public character varying(100) NOT NULL,
    private character varying(250),
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 16501)
-- Name: idp_user_recovery_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_user_recovery_info (
    id uuid NOT NULL,
    "user" uuid NOT NULL,
    tenant uuid,
    type smallint NOT NULL,
    value character varying(250) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16504)
-- Name: idp_version_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_version_info (
    key character varying(50) NOT NULL,
    version character varying(50) NOT NULL,
    released_at timestamp without time zone,
    deployed_at timestamp without time zone,
    description text
);


--
-- TOC entry 230 (class 1259 OID 16510)
-- Name: idp_what_you_know_about_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_what_you_know_about_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    storage_file uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 16513)
-- Name: ntf_contact_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_contact_info (
    id uuid NOT NULL,
    "user" uuid NOT NULL,
    tenant uuid,
    type smallint NOT NULL,
    value character varying(250) NOT NULL,
    ordinal integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 16516)
-- Name: ntf_forget_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_forget_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 16519)
-- Name: ntf_in_app_notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_in_app_notification (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    type uuid NOT NULL,
    tracking_state smallint NOT NULL,
    subject text,
    body text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    priority smallint DEFAULT 0 NOT NULL,
    extra_data text,
    read_time timestamp without time zone
);


--
-- TOC entry 234 (class 1259 OID 16526)
-- Name: ntf_notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_notification (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid,
    is_active smallint NOT NULL,
    type uuid NOT NULL,
    contact_type_hint smallint,
    contact_hint text,
    data text,
    notify_state smallint NOT NULL,
    notified_with smallint,
    notified_at timestamp without time zone,
    retry_count integer,
    tracking_state smallint NOT NULL,
    tracking_process smallint NOT NULL,
    tracking_data text,
    provenance_ref character varying(50),
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16532)
-- Name: ntf_notification_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_notification_template (
    id uuid NOT NULL,
    tenant uuid,
    channel smallint NOT NULL,
    notification_type uuid NOT NULL,
    kind smallint NOT NULL,
    language character varying(20) NOT NULL,
    description character varying(250) NOT NULL,
    value text NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 16538)
-- Name: ntf_queue_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_queue_inbox (
    id uuid NOT NULL,
    tenant uuid,
    queue character varying(50) NOT NULL,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    application_id character varying(100) NOT NULL,
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 16544)
-- Name: ntf_queue_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_queue_outbox (
    id uuid NOT NULL,
    tenant uuid,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    published_at timestamp without time zone,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 16550)
-- Name: ntf_storage_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_storage_file (
    id uuid NOT NULL,
    tenant uuid,
    file_ref character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    extension character varying(10) NOT NULL,
    mime_type character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    purge_at timestamp without time zone,
    purged_at timestamp without time zone
);


--
-- TOC entry 239 (class 1259 OID 16553)
-- Name: ntf_tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_tenant (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 16556)
-- Name: ntf_tenant_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_tenant_configuration (
    id uuid NOT NULL,
    tenant uuid,
    type smallint NOT NULL,
    value text NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 16562)
-- Name: ntf_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_user (
    id uuid NOT NULL,
    tenant uuid,
    profile uuid NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 16565)
-- Name: ntf_user_notification_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_user_notification_preference (
    "user" uuid NOT NULL,
    type uuid NOT NULL,
    channel smallint NOT NULL,
    tenant uuid,
    ordinal integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 16568)
-- Name: ntf_user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_user_profile (
    id uuid NOT NULL,
    tenant uuid,
    timezone character varying(50) NOT NULL,
    culture character varying(20) NOT NULL,
    language character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 16571)
-- Name: ntf_version_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_version_info (
    key character varying(50) NOT NULL,
    version character varying(50) NOT NULL,
    released_at timestamp without time zone,
    deployed_at timestamp without time zone,
    description text
);


--
-- TOC entry 245 (class 1259 OID 16577)
-- Name: ntf_what_you_know_about_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ntf_what_you_know_about_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    storage_file uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 16580)
-- Name: usr_email_reset_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_email_reset_token (
    token character varying(50) NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    email character varying(250),
    is_consumed smallint NOT NULL,
    is_active smallint NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 247 (class 1259 OID 16583)
-- Name: usr_forget_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_forget_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 248 (class 1259 OID 16586)
-- Name: usr_forget_me_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_forget_me_request (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    is_validated smallint NOT NULL,
    state smallint NOT NULL,
    token character varying(50) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 249 (class 1259 OID 16589)
-- Name: usr_forget_me_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_forget_me_result (
    id uuid NOT NULL,
    tenant uuid,
    request uuid NOT NULL,
    source character varying(250) NOT NULL,
    status smallint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 16592)
-- Name: usr_queue_inbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_queue_inbox (
    id uuid NOT NULL,
    tenant uuid,
    queue character varying(50) NOT NULL,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    application_id character varying(100) NOT NULL,
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 251 (class 1259 OID 16598)
-- Name: usr_queue_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_queue_outbox (
    id uuid NOT NULL,
    tenant uuid,
    exchange character varying(50) NOT NULL,
    route character varying(50),
    message_id uuid NOT NULL,
    message text NOT NULL,
    is_active smallint NOT NULL,
    status smallint NOT NULL,
    retry_count integer NOT NULL,
    published_at timestamp without time zone,
    confirmed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 252 (class 1259 OID 16604)
-- Name: usr_storage_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_storage_file (
    id uuid NOT NULL,
    tenant uuid,
    file_ref character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    extension character varying(10) NOT NULL,
    mime_type character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    purge_at timestamp without time zone,
    purged_at timestamp without time zone
);


--
-- TOC entry 253 (class 1259 OID 16607)
-- Name: usr_tenant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_tenant (
    id uuid NOT NULL,
    code character varying(50) NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 254 (class 1259 OID 16610)
-- Name: usr_tenant_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_tenant_configuration (
    id uuid NOT NULL,
    tenant uuid,
    type smallint NOT NULL,
    value text NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 255 (class 1259 OID 16616)
-- Name: usr_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_user (
    id uuid NOT NULL,
    tenant uuid,
    profile uuid NOT NULL,
    is_active smallint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    name character varying(250) NOT NULL,
    type smallint NOT NULL
);


--
-- TOC entry 256 (class 1259 OID 16619)
-- Name: usr_user_contact_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_user_contact_info (
    "user" uuid NOT NULL,
    type smallint NOT NULL,
    tenant uuid,
    value character varying(250) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 16622)
-- Name: usr_user_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_user_profile (
    id uuid NOT NULL,
    tenant uuid,
    timezone character varying(50) NOT NULL,
    culture character varying(20) NOT NULL,
    language character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_tentative smallint NOT NULL,
    profile_picture_url text,
    profile_picture_storage_file uuid
);


--
-- TOC entry 258 (class 1259 OID 16628)
-- Name: usr_user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_user_settings (
    id uuid NOT NULL,
    tenant uuid,
    type smallint NOT NULL,
    key character varying(250) NOT NULL,
    "user" uuid NOT NULL,
    name character varying(200),
    value text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- TOC entry 259 (class 1259 OID 16634)
-- Name: usr_version_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_version_info (
    key character varying(50) NOT NULL,
    version character varying(50) NOT NULL,
    released_at timestamp without time zone,
    deployed_at timestamp without time zone,
    description text
);


--
-- TOC entry 260 (class 1259 OID 16640)
-- Name: usr_what_you_know_about_me; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_what_you_know_about_me (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    state smallint NOT NULL,
    storage_file uuid,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 261 (class 1259 OID 16643)
-- Name: usr_what_you_know_about_me_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_what_you_know_about_me_request (
    id uuid NOT NULL,
    tenant uuid,
    "user" uuid NOT NULL,
    is_active smallint NOT NULL,
    is_validated smallint NOT NULL,
    storage_file uuid,
    state smallint NOT NULL,
    token character varying(50) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at bigint NOT NULL
);


--
-- TOC entry 262 (class 1259 OID 16646)
-- Name: usr_what_you_know_about_me_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usr_what_you_know_about_me_result (
    id uuid NOT NULL,
    tenant uuid,
    request uuid NOT NULL,
    source character varying(250) NOT NULL,
    status smallint NOT NULL,
    storage_file uuid,
    created_at timestamp without time zone NOT NULL
);


--
-- TOC entry 3088 (class 2604 OID 16649)
-- Name: idp_tenant_credential_provider id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_tenant_credential_provider ALTER COLUMN id SET DEFAULT nextval('public.idp_tenant_credential_provider_id_seq'::regclass);


--
-- TOC entry 3089 (class 2604 OID 16650)
-- Name: idp_user_claim id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_claim ALTER COLUMN id SET DEFAULT nextval('public.idp_user_claim_id_seq'::regclass);


--
-- TOC entry 3220 (class 2606 OID 30446)
-- Name: app_queue_outbox app_queue_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_queue_outbox
    ADD CONSTRAINT app_queue_outbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3224 (class 2606 OID 102422)
-- Name: app_rank_recalculation_task app_rank_recalculation_task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_rank_recalculation_task
    ADD CONSTRAINT app_rank_recalculation_task_pkey PRIMARY KEY (id);


--
-- TOC entry 3222 (class 2606 OID 59472)
-- Name: app_version_info app_version_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_version_info
    ADD CONSTRAINT app_version_info_pkey PRIMARY KEY (key);


--
-- TOC entry 3092 (class 2606 OID 16652)
-- Name: bp_blueprint_template bp_blueprint_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_blueprint_template
    ADD CONSTRAINT bp_blueprint_template_pkey PRIMARY KEY (id);


--
-- TOC entry 3094 (class 2606 OID 16654)
-- Name: bp_forget_me bp_forget_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_forget_me
    ADD CONSTRAINT bp_forget_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3098 (class 2606 OID 16656)
-- Name: bp_queue_outbox bp_queue_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_queue_outbox
    ADD CONSTRAINT bp_queue_inbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3096 (class 2606 OID 16658)
-- Name: bp_queue_inbox bp_queue_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_queue_inbox
    ADD CONSTRAINT bp_queue_outbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3100 (class 2606 OID 16660)
-- Name: bp_storage_file bp_storage_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_storage_file
    ADD CONSTRAINT bp_storage_file_pkey PRIMARY KEY (id);


--
-- TOC entry 3104 (class 2606 OID 16662)
-- Name: bp_tenant_configuration bp_tenant_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_tenant_configuration
    ADD CONSTRAINT bp_tenant_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 3102 (class 2606 OID 16664)
-- Name: bp_tenant bp_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_tenant
    ADD CONSTRAINT bp_tenant_pkey PRIMARY KEY (id);


--
-- TOC entry 3106 (class 2606 OID 16666)
-- Name: bp_user bp_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_user
    ADD CONSTRAINT bp_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3108 (class 2606 OID 16668)
-- Name: bp_user_profile bp_user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_user_profile
    ADD CONSTRAINT bp_user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 3110 (class 2606 OID 16670)
-- Name: bp_version_info bp_version_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_version_info
    ADD CONSTRAINT bp_version_info_pkey PRIMARY KEY (key);


--
-- TOC entry 3112 (class 2606 OID 16672)
-- Name: bp_what_you_know_about_me bp_what_you_know_about_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_what_you_know_about_me
    ADD CONSTRAINT bp_what_you_know_about_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3114 (class 2606 OID 16674)
-- Name: idp_credential_reset_token idp_credential_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_credential_reset_token
    ADD CONSTRAINT idp_credential_reset_token_pkey PRIMARY KEY (token);


--
-- TOC entry 3116 (class 2606 OID 16676)
-- Name: idp_forget_me idp_forget_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_forget_me
    ADD CONSTRAINT idp_forget_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3119 (class 2606 OID 16678)
-- Name: idp_persisted_grant idp_persisted_grant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_persisted_grant
    ADD CONSTRAINT idp_persisted_grant_pkey PRIMARY KEY (key);


--
-- TOC entry 3123 (class 2606 OID 16680)
-- Name: idp_queue_outbox idp_queue_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_queue_outbox
    ADD CONSTRAINT idp_queue_inbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3121 (class 2606 OID 16682)
-- Name: idp_queue_inbox idp_queue_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_queue_inbox
    ADD CONSTRAINT idp_queue_outbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3125 (class 2606 OID 16684)
-- Name: idp_registration_invitation idp_registration_invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_registration_invitation
    ADD CONSTRAINT idp_registration_invitation_pkey PRIMARY KEY (token);


--
-- TOC entry 3127 (class 2606 OID 16686)
-- Name: idp_storage_file idp_storage_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_storage_file
    ADD CONSTRAINT idp_storage_file_pkey PRIMARY KEY (id);


--
-- TOC entry 3133 (class 2606 OID 16688)
-- Name: idp_tenant_credential_provider idp_tenant_credential_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_tenant_credential_provider
    ADD CONSTRAINT idp_tenant_credential_provider_pkey PRIMARY KEY (id);


--
-- TOC entry 3130 (class 2606 OID 16690)
-- Name: idp_tenant idp_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_tenant
    ADD CONSTRAINT idp_tenant_pkey PRIMARY KEY (id);


--
-- TOC entry 3135 (class 2606 OID 16692)
-- Name: idp_used_totp_token idp_used_totp_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_used_totp_token
    ADD CONSTRAINT idp_used_totp_token_pkey PRIMARY KEY ("user", totp);


--
-- TOC entry 3139 (class 2606 OID 16694)
-- Name: idp_user_claim idp_user_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_claim
    ADD CONSTRAINT idp_user_claim_pkey PRIMARY KEY (id);


--
-- TOC entry 3143 (class 2606 OID 16696)
-- Name: idp_user_consent_history idp_user_consent_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_consent_history
    ADD CONSTRAINT idp_user_consent_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3141 (class 2606 OID 16698)
-- Name: idp_user_consent idp_user_consent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_consent
    ADD CONSTRAINT idp_user_consent_pkey PRIMARY KEY ("user", consent);


--
-- TOC entry 3146 (class 2606 OID 16700)
-- Name: idp_user_credential idp_user_credential_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_credential
    ADD CONSTRAINT idp_user_credential_pkey PRIMARY KEY ("user", provider);


--
-- TOC entry 3137 (class 2606 OID 16702)
-- Name: idp_user idp_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user
    ADD CONSTRAINT idp_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3148 (class 2606 OID 16704)
-- Name: idp_user_recovery_info idp_user_recovery_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_recovery_info
    ADD CONSTRAINT idp_user_recovery_info_pkey PRIMARY KEY (id);


--
-- TOC entry 3150 (class 2606 OID 16706)
-- Name: idp_version_info idp_version_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_version_info
    ADD CONSTRAINT idp_version_info_pkey PRIMARY KEY (key);


--
-- TOC entry 3152 (class 2606 OID 16708)
-- Name: idp_what_you_know_about_me idp_what_you_know_about_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_what_you_know_about_me
    ADD CONSTRAINT idp_what_you_know_about_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3154 (class 2606 OID 16710)
-- Name: ntf_contact_info ntf_contact_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_contact_info
    ADD CONSTRAINT ntf_contact_info_pkey PRIMARY KEY (id);


--
-- TOC entry 3156 (class 2606 OID 16712)
-- Name: ntf_forget_me ntf_forget_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_forget_me
    ADD CONSTRAINT ntf_forget_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3158 (class 2606 OID 16714)
-- Name: ntf_in_app_notification ntf_in_app_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_in_app_notification
    ADD CONSTRAINT ntf_in_app_notification_pkey PRIMARY KEY (id);


--
-- TOC entry 3160 (class 2606 OID 16716)
-- Name: ntf_notification ntf_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_notification
    ADD CONSTRAINT ntf_notification_pkey PRIMARY KEY (id);


--
-- TOC entry 3162 (class 2606 OID 16718)
-- Name: ntf_notification_template ntf_notification_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_notification_template
    ADD CONSTRAINT ntf_notification_template_pkey PRIMARY KEY (id);


--
-- TOC entry 3166 (class 2606 OID 16720)
-- Name: ntf_queue_outbox ntf_queue_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_queue_outbox
    ADD CONSTRAINT ntf_queue_inbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3164 (class 2606 OID 16722)
-- Name: ntf_queue_inbox ntf_queue_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_queue_inbox
    ADD CONSTRAINT ntf_queue_outbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3168 (class 2606 OID 16724)
-- Name: ntf_storage_file ntf_storage_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_storage_file
    ADD CONSTRAINT ntf_storage_file_pkey PRIMARY KEY (id);


--
-- TOC entry 3172 (class 2606 OID 16726)
-- Name: ntf_tenant_configuration ntf_tenant_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_tenant_configuration
    ADD CONSTRAINT ntf_tenant_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 3170 (class 2606 OID 16728)
-- Name: ntf_tenant ntf_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_tenant
    ADD CONSTRAINT ntf_tenant_pkey PRIMARY KEY (id);


--
-- TOC entry 3176 (class 2606 OID 16730)
-- Name: ntf_user_notification_preference ntf_user_notification_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user_notification_preference
    ADD CONSTRAINT ntf_user_notification_preference_pkey PRIMARY KEY ("user", type, channel);


--
-- TOC entry 3174 (class 2606 OID 16732)
-- Name: ntf_user ntf_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user
    ADD CONSTRAINT ntf_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3178 (class 2606 OID 16734)
-- Name: ntf_user_profile ntf_user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user_profile
    ADD CONSTRAINT ntf_user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 3180 (class 2606 OID 16736)
-- Name: ntf_version_info ntf_version_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_version_info
    ADD CONSTRAINT ntf_version_info_pkey PRIMARY KEY (key);


--
-- TOC entry 3182 (class 2606 OID 16738)
-- Name: ntf_what_you_know_about_me ntf_what_you_know_about_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_what_you_know_about_me
    ADD CONSTRAINT ntf_what_you_know_about_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3218 (class 2606 OID 17160)
-- Name: app_queue_inbox queue_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_queue_inbox
    ADD CONSTRAINT queue_inbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3184 (class 2606 OID 16740)
-- Name: usr_email_reset_token usr_email_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_email_reset_token
    ADD CONSTRAINT usr_email_reset_token_pkey PRIMARY KEY (token);


--
-- TOC entry 3186 (class 2606 OID 16742)
-- Name: usr_forget_me usr_forget_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me
    ADD CONSTRAINT usr_forget_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3188 (class 2606 OID 16744)
-- Name: usr_forget_me_request usr_forget_me_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me_request
    ADD CONSTRAINT usr_forget_me_request_pkey PRIMARY KEY (id);


--
-- TOC entry 3190 (class 2606 OID 16746)
-- Name: usr_forget_me_result usr_forget_me_result_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me_result
    ADD CONSTRAINT usr_forget_me_result_pkey PRIMARY KEY (id);


--
-- TOC entry 3194 (class 2606 OID 16748)
-- Name: usr_queue_outbox usr_queue_inbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_queue_outbox
    ADD CONSTRAINT usr_queue_inbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3192 (class 2606 OID 16750)
-- Name: usr_queue_inbox usr_queue_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_queue_inbox
    ADD CONSTRAINT usr_queue_outbox_pkey PRIMARY KEY (id);


--
-- TOC entry 3196 (class 2606 OID 16752)
-- Name: usr_storage_file usr_storage_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_storage_file
    ADD CONSTRAINT usr_storage_file_pkey PRIMARY KEY (id);


--
-- TOC entry 3200 (class 2606 OID 16754)
-- Name: usr_tenant_configuration usr_tenant_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_tenant_configuration
    ADD CONSTRAINT usr_tenant_configuration_pkey PRIMARY KEY (id);


--
-- TOC entry 3198 (class 2606 OID 16756)
-- Name: usr_tenant usr_tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_tenant
    ADD CONSTRAINT usr_tenant_pkey PRIMARY KEY (id);


--
-- TOC entry 3204 (class 2606 OID 16758)
-- Name: usr_user_contact_info usr_user_contact_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_contact_info
    ADD CONSTRAINT usr_user_contact_info_pkey PRIMARY KEY ("user", type);


--
-- TOC entry 3202 (class 2606 OID 16760)
-- Name: usr_user usr_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user
    ADD CONSTRAINT usr_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3206 (class 2606 OID 16762)
-- Name: usr_user_profile usr_user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_profile
    ADD CONSTRAINT usr_user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 3208 (class 2606 OID 16764)
-- Name: usr_user_settings usr_user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_settings
    ADD CONSTRAINT usr_user_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3210 (class 2606 OID 16766)
-- Name: usr_version_info usr_version_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_version_info
    ADD CONSTRAINT usr_version_info_pkey PRIMARY KEY (key);


--
-- TOC entry 3212 (class 2606 OID 16768)
-- Name: usr_what_you_know_about_me usr_what_you_know_about_me_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me
    ADD CONSTRAINT usr_what_you_know_about_me_pkey PRIMARY KEY (id);


--
-- TOC entry 3214 (class 2606 OID 16770)
-- Name: usr_what_you_know_about_me_request usr_what_you_know_about_me_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me_request
    ADD CONSTRAINT usr_what_you_know_about_me_request_pkey PRIMARY KEY (id);


--
-- TOC entry 3216 (class 2606 OID 16772)
-- Name: usr_what_you_know_about_me_result usr_what_you_know_about_me_result_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me_result
    ADD CONSTRAINT usr_what_you_know_about_me_result_pkey PRIMARY KEY (id);


--
-- TOC entry 3117 (class 1259 OID 16773)
-- Name: IX_idp_PersistedGrant_SubjectId_ClientId_Type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_idp_PersistedGrant_SubjectId_ClientId_Type" ON public.idp_persisted_grant USING btree (client_id, subject_id, type);


--
-- TOC entry 3131 (class 1259 OID 16774)
-- Name: UNIQUE_idp_TenantCredentialProvider_Tenant_Provider; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UNIQUE_idp_TenantCredentialProvider_Tenant_Provider" ON public.idp_tenant_credential_provider USING btree (tenant, provider);


--
-- TOC entry 3128 (class 1259 OID 16775)
-- Name: UNIQUE_idp_Tenant_Code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UNIQUE_idp_Tenant_Code" ON public.idp_tenant USING btree (code);


--
-- TOC entry 3144 (class 1259 OID 16776)
-- Name: UNIQUE_idp_UserCredential_Tenant_Provider_Public; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UNIQUE_idp_UserCredential_Tenant_Provider_Public" ON public.idp_user_credential USING btree (provider, tenant, public);


--
-- TOC entry 3225 (class 2606 OID 16777)
-- Name: bp_blueprint_template bp_blueprint_template_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_blueprint_template
    ADD CONSTRAINT bp_blueprint_template_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3226 (class 2606 OID 16782)
-- Name: bp_forget_me bp_forget_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_forget_me
    ADD CONSTRAINT bp_forget_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3227 (class 2606 OID 16787)
-- Name: bp_forget_me bp_forget_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_forget_me
    ADD CONSTRAINT bp_forget_me_user_fkey FOREIGN KEY ("user") REFERENCES public.bp_user(id) NOT VALID;


--
-- TOC entry 3228 (class 2606 OID 16792)
-- Name: bp_storage_file bp_storage_file_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_storage_file
    ADD CONSTRAINT bp_storage_file_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3229 (class 2606 OID 16797)
-- Name: bp_tenant_configuration bp_tenant_configuration_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_tenant_configuration
    ADD CONSTRAINT bp_tenant_configuration_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3230 (class 2606 OID 16802)
-- Name: bp_user bp_user_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_user
    ADD CONSTRAINT bp_user_profile_fkey FOREIGN KEY (profile) REFERENCES public.bp_user_profile(id) NOT VALID;


--
-- TOC entry 3232 (class 2606 OID 16807)
-- Name: bp_user_profile bp_user_profile_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_user_profile
    ADD CONSTRAINT bp_user_profile_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3231 (class 2606 OID 16812)
-- Name: bp_user bp_user_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_user
    ADD CONSTRAINT bp_user_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3233 (class 2606 OID 16817)
-- Name: bp_what_you_know_about_me bp_what_you_know_about_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_what_you_know_about_me
    ADD CONSTRAINT bp_what_you_know_about_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.bp_tenant(id) NOT VALID;


--
-- TOC entry 3234 (class 2606 OID 16822)
-- Name: bp_what_you_know_about_me bp_what_you_know_about_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bp_what_you_know_about_me
    ADD CONSTRAINT bp_what_you_know_about_me_user_fkey FOREIGN KEY ("user") REFERENCES public.bp_user(id) NOT VALID;


--
-- TOC entry 3235 (class 2606 OID 16827)
-- Name: idp_credential_reset_token idp_credential_reset_token_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_credential_reset_token
    ADD CONSTRAINT idp_credential_reset_token_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3236 (class 2606 OID 16832)
-- Name: idp_credential_reset_token idp_credential_reset_token_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_credential_reset_token
    ADD CONSTRAINT idp_credential_reset_token_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3237 (class 2606 OID 16837)
-- Name: idp_forget_me idp_forget_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_forget_me
    ADD CONSTRAINT idp_forget_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3238 (class 2606 OID 16842)
-- Name: idp_forget_me idp_forget_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_forget_me
    ADD CONSTRAINT idp_forget_me_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3239 (class 2606 OID 16847)
-- Name: idp_persisted_grant idp_persisted_grant_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_persisted_grant
    ADD CONSTRAINT idp_persisted_grant_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3240 (class 2606 OID 16852)
-- Name: idp_registration_invitation idp_registration_invitation_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_registration_invitation
    ADD CONSTRAINT idp_registration_invitation_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3241 (class 2606 OID 16857)
-- Name: idp_registration_invitation idp_registration_invitation_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_registration_invitation
    ADD CONSTRAINT idp_registration_invitation_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3242 (class 2606 OID 16862)
-- Name: idp_storage_file idp_storage_file_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_storage_file
    ADD CONSTRAINT idp_storage_file_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3243 (class 2606 OID 16867)
-- Name: idp_tenant_credential_provider idp_tenant_credential_provider_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_tenant_credential_provider
    ADD CONSTRAINT idp_tenant_credential_provider_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3244 (class 2606 OID 16872)
-- Name: idp_used_totp_token idp_used_totp_token_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_used_totp_token
    ADD CONSTRAINT idp_used_totp_token_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3246 (class 2606 OID 16877)
-- Name: idp_user_claim idp_user_claim_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_claim
    ADD CONSTRAINT idp_user_claim_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3247 (class 2606 OID 16882)
-- Name: idp_user_claim idp_user_claim_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_claim
    ADD CONSTRAINT idp_user_claim_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3250 (class 2606 OID 16887)
-- Name: idp_user_consent_history idp_user_consent_history_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_consent_history
    ADD CONSTRAINT idp_user_consent_history_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3251 (class 2606 OID 16892)
-- Name: idp_user_consent_history idp_user_consent_history_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_consent_history
    ADD CONSTRAINT idp_user_consent_history_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3248 (class 2606 OID 16897)
-- Name: idp_user_consent idp_user_consent_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_consent
    ADD CONSTRAINT idp_user_consent_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3249 (class 2606 OID 16902)
-- Name: idp_user_consent idp_user_consent_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_consent
    ADD CONSTRAINT idp_user_consent_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3252 (class 2606 OID 16907)
-- Name: idp_user_credential idp_user_credential_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_credential
    ADD CONSTRAINT idp_user_credential_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3253 (class 2606 OID 16912)
-- Name: idp_user_credential idp_user_credential_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_credential
    ADD CONSTRAINT idp_user_credential_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3254 (class 2606 OID 16917)
-- Name: idp_user_recovery_info idp_user_recovery_info_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_recovery_info
    ADD CONSTRAINT idp_user_recovery_info_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3255 (class 2606 OID 16922)
-- Name: idp_user_recovery_info idp_user_recovery_info_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user_recovery_info
    ADD CONSTRAINT idp_user_recovery_info_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3245 (class 2606 OID 16927)
-- Name: idp_user idp_user_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_user
    ADD CONSTRAINT idp_user_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3256 (class 2606 OID 16932)
-- Name: idp_what_you_know_about_me idp_what_you_know_about_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_what_you_know_about_me
    ADD CONSTRAINT idp_what_you_know_about_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.idp_tenant(id) NOT VALID;


--
-- TOC entry 3257 (class 2606 OID 16937)
-- Name: idp_what_you_know_about_me idp_what_you_know_about_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_what_you_know_about_me
    ADD CONSTRAINT idp_what_you_know_about_me_user_fkey FOREIGN KEY ("user") REFERENCES public.idp_user(id) NOT VALID;


--
-- TOC entry 3258 (class 2606 OID 16942)
-- Name: ntf_contact_info ntf_contact_info_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_contact_info
    ADD CONSTRAINT ntf_contact_info_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3259 (class 2606 OID 16947)
-- Name: ntf_contact_info ntf_contact_info_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_contact_info
    ADD CONSTRAINT ntf_contact_info_user_fkey FOREIGN KEY ("user") REFERENCES public.ntf_user(id) NOT VALID;


--
-- TOC entry 3260 (class 2606 OID 16952)
-- Name: ntf_forget_me ntf_forget_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_forget_me
    ADD CONSTRAINT ntf_forget_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3261 (class 2606 OID 16957)
-- Name: ntf_forget_me ntf_forget_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_forget_me
    ADD CONSTRAINT ntf_forget_me_user_fkey FOREIGN KEY ("user") REFERENCES public.ntf_user(id) NOT VALID;


--
-- TOC entry 3262 (class 2606 OID 16962)
-- Name: ntf_in_app_notification ntf_in_app_notification_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_in_app_notification
    ADD CONSTRAINT ntf_in_app_notification_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3263 (class 2606 OID 16967)
-- Name: ntf_in_app_notification ntf_in_app_notification_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_in_app_notification
    ADD CONSTRAINT ntf_in_app_notification_user_fkey FOREIGN KEY ("user") REFERENCES public.ntf_user(id) NOT VALID;


--
-- TOC entry 3266 (class 2606 OID 16972)
-- Name: ntf_notification_template ntf_notification_template_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_notification_template
    ADD CONSTRAINT ntf_notification_template_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3264 (class 2606 OID 16977)
-- Name: ntf_notification ntf_notification_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_notification
    ADD CONSTRAINT ntf_notification_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3265 (class 2606 OID 16982)
-- Name: ntf_notification ntf_notification_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_notification
    ADD CONSTRAINT ntf_notification_user_fkey FOREIGN KEY ("user") REFERENCES public.ntf_user(id) NOT VALID;


--
-- TOC entry 3267 (class 2606 OID 16987)
-- Name: ntf_storage_file ntf_storage_file_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_storage_file
    ADD CONSTRAINT ntf_storage_file_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3268 (class 2606 OID 16992)
-- Name: ntf_tenant_configuration ntf_tenant_configuration_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_tenant_configuration
    ADD CONSTRAINT ntf_tenant_configuration_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3271 (class 2606 OID 16997)
-- Name: ntf_user_notification_preference ntf_user_notification_preference_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user_notification_preference
    ADD CONSTRAINT ntf_user_notification_preference_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3272 (class 2606 OID 17002)
-- Name: ntf_user_notification_preference ntf_user_notification_preference_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user_notification_preference
    ADD CONSTRAINT ntf_user_notification_preference_user_fkey FOREIGN KEY ("user") REFERENCES public.ntf_user(id) NOT VALID;


--
-- TOC entry 3269 (class 2606 OID 17007)
-- Name: ntf_user ntf_user_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user
    ADD CONSTRAINT ntf_user_profile_fkey FOREIGN KEY (profile) REFERENCES public.ntf_user_profile(id) NOT VALID;


--
-- TOC entry 3273 (class 2606 OID 17012)
-- Name: ntf_user_profile ntf_user_profile_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user_profile
    ADD CONSTRAINT ntf_user_profile_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3270 (class 2606 OID 17017)
-- Name: ntf_user ntf_user_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_user
    ADD CONSTRAINT ntf_user_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3274 (class 2606 OID 17022)
-- Name: ntf_what_you_know_about_me ntf_what_you_know_about_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_what_you_know_about_me
    ADD CONSTRAINT ntf_what_you_know_about_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.ntf_tenant(id) NOT VALID;


--
-- TOC entry 3275 (class 2606 OID 17027)
-- Name: ntf_what_you_know_about_me ntf_what_you_know_about_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ntf_what_you_know_about_me
    ADD CONSTRAINT ntf_what_you_know_about_me_user_fkey FOREIGN KEY ("user") REFERENCES public.ntf_user(id) NOT VALID;


--
-- TOC entry 3276 (class 2606 OID 17032)
-- Name: usr_email_reset_token usr_email_reset_token_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_email_reset_token
    ADD CONSTRAINT usr_email_reset_token_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3277 (class 2606 OID 17037)
-- Name: usr_email_reset_token usr_email_reset_token_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_email_reset_token
    ADD CONSTRAINT usr_email_reset_token_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;


--
-- TOC entry 3280 (class 2606 OID 17042)
-- Name: usr_forget_me_request usr_forget_me_request_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me_request
    ADD CONSTRAINT usr_forget_me_request_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3281 (class 2606 OID 17047)
-- Name: usr_forget_me_request usr_forget_me_request_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me_request
    ADD CONSTRAINT usr_forget_me_request_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;


--
-- TOC entry 3282 (class 2606 OID 17052)
-- Name: usr_forget_me_result usr_forget_me_result_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me_result
    ADD CONSTRAINT usr_forget_me_result_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3278 (class 2606 OID 17057)
-- Name: usr_forget_me usr_forget_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me
    ADD CONSTRAINT usr_forget_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3279 (class 2606 OID 17062)
-- Name: usr_forget_me usr_forget_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_forget_me
    ADD CONSTRAINT usr_forget_me_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;


--
-- TOC entry 3283 (class 2606 OID 17067)
-- Name: usr_storage_file usr_storage_file_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_storage_file
    ADD CONSTRAINT usr_storage_file_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3284 (class 2606 OID 17072)
-- Name: usr_tenant_configuration usr_tenant_configuration_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_tenant_configuration
    ADD CONSTRAINT usr_tenant_configuration_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3287 (class 2606 OID 17077)
-- Name: usr_user_contact_info usr_user_contact_info_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_contact_info
    ADD CONSTRAINT usr_user_contact_info_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3288 (class 2606 OID 17082)
-- Name: usr_user_contact_info usr_user_contact_info_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_contact_info
    ADD CONSTRAINT usr_user_contact_info_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;


--
-- TOC entry 3285 (class 2606 OID 17087)
-- Name: usr_user usr_user_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user
    ADD CONSTRAINT usr_user_profile_fkey FOREIGN KEY (profile) REFERENCES public.usr_user_profile(id) NOT VALID;


--
-- TOC entry 3289 (class 2606 OID 17092)
-- Name: usr_user_profile usr_user_profile_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_profile
    ADD CONSTRAINT usr_user_profile_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3290 (class 2606 OID 17097)
-- Name: usr_user_settings usr_user_settings_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_settings
    ADD CONSTRAINT usr_user_settings_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3291 (class 2606 OID 17102)
-- Name: usr_user_settings usr_user_settings_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user_settings
    ADD CONSTRAINT usr_user_settings_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;


--
-- TOC entry 3286 (class 2606 OID 17107)
-- Name: usr_user usr_user_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_user
    ADD CONSTRAINT usr_user_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3294 (class 2606 OID 17112)
-- Name: usr_what_you_know_about_me_request usr_what_you_know_about_me_request_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me_request
    ADD CONSTRAINT usr_what_you_know_about_me_request_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3295 (class 2606 OID 17117)
-- Name: usr_what_you_know_about_me_request usr_what_you_know_about_me_request_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me_request
    ADD CONSTRAINT usr_what_you_know_about_me_request_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;


--
-- TOC entry 3296 (class 2606 OID 17122)
-- Name: usr_what_you_know_about_me_result usr_what_you_know_about_me_result_request_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me_result
    ADD CONSTRAINT usr_what_you_know_about_me_result_request_fkey FOREIGN KEY (request) REFERENCES public.usr_what_you_know_about_me_request(id) NOT VALID;


--
-- TOC entry 3297 (class 2606 OID 17127)
-- Name: usr_what_you_know_about_me_result usr_what_you_know_about_me_result_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me_result
    ADD CONSTRAINT usr_what_you_know_about_me_result_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3292 (class 2606 OID 17132)
-- Name: usr_what_you_know_about_me usr_what_you_know_about_me_tenant_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me
    ADD CONSTRAINT usr_what_you_know_about_me_tenant_fkey FOREIGN KEY (tenant) REFERENCES public.usr_tenant(id) NOT VALID;


--
-- TOC entry 3293 (class 2606 OID 17137)
-- Name: usr_what_you_know_about_me usr_what_you_know_about_me_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usr_what_you_know_about_me
    ADD CONSTRAINT usr_what_you_know_about_me_user_fkey FOREIGN KEY ("user") REFERENCES public.usr_user(id) NOT VALID;

