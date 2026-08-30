export interface PlantbookSearchResponse {
	count: number
	next: string
	previous: string
	results: PlantbookSearchPlant[]
}

export interface PlantbookSearchPlant {
	pid: string
	display_pid: string
	alias: string
	category: string
}

export interface PlantbookPlant {
	pid: string
	display_pid: string
	category: string

	max_light_mmol: number
	min_light_mmol: number

	max_light_lux: number
	min_light_lux: number

	max_temp: number
	min_temp: number

	max_env_humid: number
	min_env_humid: number

	max_soil_moist: number
	min_soil_moist: number

	max_soil_ec: number
	min_soil_ec: number

	care: PlantCare

	origin: string
	image_url: string
	common_names: [
		name: string,
		language_code: string,
	]
}

export interface PlantCare {
	light: string
	humid: string
	soil: string
}
