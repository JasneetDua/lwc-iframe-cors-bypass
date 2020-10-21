import { LightningElement, track, api } from 'lwc';

export default class CustomIframe extends LightningElement {
    @api url;
    renderedCallback(){
        this.fetchProxy(this.url, {})
        .then(res => res.text())
        .then(data => {
            if (data) {
                data = data.replace(/<head([^>]*)>/i, `<head$1>
                    <base href="${this.url}">
                    <script>
                    // X-Frame-Bypass navigation event handlers
                    document.addEventListener('click', e => {
                        if (frameElement && document.activeElement && document.activeElement.href) {
                            e.preventDefault()
                            frameElement.load(document.activeElement.href)
                        }
                    })
                    document.addEventListener('submit', e => {
                        if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) {
                            e.preventDefault()
                            if (document.activeElement.form.method === 'post')
                                frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)})
                            else
                                frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form)))
                        }
                    })
                    </script>`);
                this.template.querySelector('.viewer').innerHTML = data;
            }
        })
        .catch(e => console.error('Cannot load X-Frame-Bypass:', e));
    }

    fetchProxy(url, options) {
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        return fetch(proxy + url, options).then(res => {
            if (!res.ok)
                throw new Error(`${res.status} ${res.statusText}`);
            return res
        })
        .catch(error => {
            console.log('Cannot load X-Frame-Bypass');
        })
    }
}