/**
 * Country/region reference data, backed by the `country-state-city` package.
 * Company.country stores an ISO country code; Asset.region stores a plain
 * state/province name (consistent with how siteName/client/channel are stored).
 */
import { Country, State } from "country-state-city";

export interface SelectOption {
	value: string;
	label: string;
}

/** Full list of countries for the Company Country dropdown (value = ISO code). */
export function getCountryOptions(): SelectOption[] {
	return Country.getAllCountries()
		.map((country) => ({ value: country.isoCode, label: country.name }))
		.sort((a, b) => a.label.localeCompare(b.label));
}

/** States/provinces for a given country ISO code, for the Asset Region dropdown (value = state name). */
export function getRegionOptions(countryIsoCode?: string | null): SelectOption[] {
	if (!countryIsoCode) return [];
	return State.getStatesOfCountry(countryIsoCode)
		.map((state) => ({ value: state.name, label: state.name }))
		.sort((a, b) => a.label.localeCompare(b.label));
}

/** Display name for a stored country ISO code, e.g. "ZA" -> "South Africa". */
export function getCountryName(countryIsoCode?: string | null): string {
	if (!countryIsoCode) return "";
	return Country.getCountryByCode(countryIsoCode)?.name || countryIsoCode;
}
