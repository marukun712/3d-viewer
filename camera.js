
AFRAME.registerComponent('camera-control', {
    schema: {
        homePosition: { type: 'vec3', default: { x: 0, y: 0, z: 4 } },
        vrHomePosition: { type: 'vec3', default: { x: 0, y: 0, z: 0.5 } }
    },
    init() {
        this.dragging = false;
        this.el.sceneEl.addEventListener('exit-vr', ev => this.resetPosition());
        this.el.sceneEl.addEventListener('enter-vr', ev => this.resetPosition());
        this.resetPosition();
        let cursorEl = document.getElementById('mouse-cursor');
        let canvasEl = this.el.sceneEl.canvas;
        let dragX = 0, dragY = 0;
        let lookAt = new THREE.Vector3(0, 0, 0);
        let rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        let distance = lookAt.clone().sub(this.el.getAttribute('position')).length();
        let updateCamera = () => {
            if (this.el.sceneEl.is('vr-mode')) {
                return;
            }
            let cameraObj = this.el.object3D;
            let cameraRot = new THREE.Quaternion().setFromEuler(rotation);
            let cameraVec = new THREE.Vector3(0, 0, 1).applyQuaternion(cameraRot).multiplyScalar(distance);
            let cameraPos = lookAt.clone().add(cameraVec);
            cameraObj.position.copy(cameraObj.parent.worldToLocal(cameraPos));
            cameraObj.quaternion.copy(cameraRot.multiply(cameraObj.parent.getWorldQuaternion(new THREE.Quaternion())));
        };
        this.onMouseMove = (ev) => {
            let targetObj = this.el.object3D;

            let speedFactor = 0.005;
            if (ev.buttons & 6) {
                let v = new THREE.Vector3(dragX - ev.offsetX, -(dragY - ev.offsetY), 0).applyQuaternion(targetObj.quaternion);
                lookAt.add(v.multiplyScalar(speedFactor));
            } else {
                rotation.x += (dragY - ev.offsetY) * speedFactor;
                rotation.y += (dragX - ev.offsetX) * speedFactor;
            }
            updateCamera();
            dragX = ev.offsetX;
            dragY = ev.offsetY;
        };
        canvasEl.addEventListener('mousedown', (ev) => {
            if (!this.dragging && cursorEl.components.cursor.intersectedEl == null) {
                this.dragging = true;
                dragX = ev.offsetX;
                dragY = ev.offsetY;
                canvasEl.addEventListener('mousemove', this.onMouseMove);
            }
        });
        canvasEl.addEventListener('mouseup', (ev) => {
            this.dragging = false;
            canvasEl.removeEventListener('mousemove', this.onMouseMove);
        });
        canvasEl.addEventListener('wheel', ev => {
            let speedFactor = 0.005;
            distance = Math.max(0.1, distance + ev.deltaY * speedFactor);
            updateCamera();
        });
    },
    resetPosition() {
        let sky = this.el.sceneEl.querySelector('a-sky');
        if (sky) {
            sky.object3D.visible = !this.el.sceneEl.is('ar-mode');
        }
        if (this.el.sceneEl.is('vr-mode') || this.el.sceneEl.is('ar-mode')) {
            this.el.setAttribute('position', this.data.vrHomePosition);
        } else {
            this.el.setAttribute('position', this.data.homePosition);
        }
        this.el.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    }
});

