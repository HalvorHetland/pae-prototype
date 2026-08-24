// De samme fakta — fire API-representasjoner. Brukes av /api-llm-siden.
//
// Alle fire payloads inneholder NØYAKTIG samme informasjon om hytta
// (tilgjengelige datoer, pris, tilleggstjenester). Det eneste som varierer
// er formen — og dermed token-kostnaden når en LLM skal lese svaret.
//
// Token-tallene telles LIVE på /api-llm-siden med js-tiktoken (cl100k_base
// — samme metode som measure-tokens.ts). CLI-varianten:
// npx tsx scripts/measure-api-payloads.ts

/** Tung, "enterprise" REST-respons — slik tradisjonelle API-er faktisk ser ut:
 *  konvolutt med metadata, HAL-lenker, paginering, lange beskrivende nøkler,
 *  ett objekt per dato. Alt sammen designet for maskin-til-maskin-integrasjon
 *  og menneskelige utviklere — ikke for en tokenbetalende leser. */
export const HEAVY_JSON = `{
  "response_status_information": {
    "http_status_code": 200,
    "status_message": "The request was processed successfully",
    "api_version": "v2.4.1",
    "request_identifier": "req_8f3a2b1c-9d4e-4f5a-b6c7-d8e9f0a1b2c3",
    "response_generated_at_timestamp": "2026-08-24T11:42:17.384Z"
  },
  "data": {
    "cabin_property_details": {
      "property_identifier": "sirdal-mountain-cabin",
      "property_display_name": "Sirdal Mountain Cabin",
      "pricing_information": {
        "nightly_rate_amount": 1200,
        "currency_code": "NOK",
        "rate_includes_taxes": true
      }
    },
    "availability_calendar": [
      { "calendar_date": "2025-06-07", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-08", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-09", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-14", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-15", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-16", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-21", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-22", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-28", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-06-29", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-05", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-06", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-07", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-12", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-13", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-19", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-20", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-26", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 },
      { "calendar_date": "2025-07-27", "availability_status": "AVAILABLE", "minimum_stay_nights": 1 }
    ],
    "additional_services_catalog": [
      {
        "service_identifier": "svc_bedding_standard",
        "service_display_name": "Bedding",
        "service_description": "Linen and duvet for all beds",
        "unit_price_amount": 200,
        "currency_code": "NOK",
        "_links": { "self": { "href": "/api/v2/services/svc_bedding_standard" } }
      },
      {
        "service_identifier": "svc_parking_reserved",
        "service_display_name": "Parking",
        "service_description": "Reserved parking spot",
        "unit_price_amount": 100,
        "currency_code": "NOK",
        "_links": { "self": { "href": "/api/v2/services/svc_parking_reserved" } }
      },
      {
        "service_identifier": "svc_breakfast_basket",
        "service_display_name": "Breakfast",
        "service_description": "Continental breakfast basket daily",
        "unit_price_amount": 350,
        "currency_code": "NOK",
        "_links": { "self": { "href": "/api/v2/services/svc_breakfast_basket" } }
      }
    ],
    "pagination_details": {
      "current_page_number": 1,
      "total_number_of_pages": 1,
      "items_per_page": 50,
      "total_item_count": 19
    }
  },
  "_links": {
    "self": { "href": "/api/v2/properties/sirdal-mountain-cabin/availability" },
    "documentation": { "href": "https://developer.example.com/docs/availability" }
  }
}`;

/** Flatet JSON — samme fakta, konvolutt og gjentakelser fjernet, korte nøkler. */
export const FLAT_JSON = `{
  "cabin": "sirdal-mountain-cabin",
  "currency": "NOK",
  "price_night": 1200,
  "available": [
    "2025-06-07", "2025-06-08", "2025-06-09", "2025-06-14", "2025-06-15",
    "2025-06-16", "2025-06-21", "2025-06-22", "2025-06-28", "2025-06-29",
    "2025-07-05", "2025-07-06", "2025-07-07", "2025-07-12", "2025-07-13",
    "2025-07-19", "2025-07-20", "2025-07-26", "2025-07-27"
  ],
  "addons": { "bedding": 200, "parking": 100, "breakfast": 350 }
}`;

/** Agent-formet YAML — syntakstegn borte, datoer komprimert til intervaller.
 *  Samme fakta, minimal form. */
export const AGENT_YAML = `cabin: sirdal-mountain-cabin
price: 1200 NOK/night
available 2025:
  jun: 7-9, 14-16, 21-22, 28-29
  jul: 5-7, 12-13, 19-20, 26-27
addons NOK: bedding 200, parking 100, breakfast 350`;

/** Agent-formet TSV — tabellvarianten (for datatunge svar). */
export const AGENT_TSV = `cabin\tsirdal-mountain-cabin
price_night_nok\t1200
available\t2025-06: 07 08 09 14 15 16 21 22 28 29; 2025-07: 05 06 07 12 13 19 20 26 27
addon\tbedding\t200
addon\tparking\t100
addon\tbreakfast\t350`;

/** Det agenten faktisk TRENGTE for oppgaven "er hytta ledig 14.–16. juni,
 *  og hva koster to netter med sengetøy og frokost?" */
export const TASK_ANSWER = `ledig: ja (14., 15., 16. juni)
pris: 2 × 1200 + 200 + 2 × 350 = 3 300 NOK`;
