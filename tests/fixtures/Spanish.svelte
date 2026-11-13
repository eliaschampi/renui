<script lang="ts">
	import { renEs, Pagination, setRenLocale } from '../../src/lib';

	setRenLocale({ locale: 'es-PE', currency: 'PEN', messages: renEs });
</script>

<Pagination page={2} pages={5} href={(page) => `?page=${page}`} />
